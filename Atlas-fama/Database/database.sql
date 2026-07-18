--
-- PostgreSQL database dump
--


-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: prj_D5Snfw9QodSQ; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "prj_D5Snfw9QodSQ";


--
-- Name: prj_D5Snfw9QodSQ_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "prj_D5Snfw9QodSQ_auth";


--
-- Name: prj_D5Snfw9QodSQ_storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "prj_D5Snfw9QodSQ_storage";


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: crm_campaigns; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subject text,
    html_body text,
    text_body text,
    channel text DEFAULT 'email'::text NOT NULL,
    status text DEFAULT 'draft'::text,
    list_id uuid,
    filter_query jsonb,
    list_ids jsonb,
    style_preset text,
    images jsonb,
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    total_recipients integer DEFAULT 0,
    total_sent integer DEFAULT 0,
    total_opened integer DEFAULT 0,
    total_clicked integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    goal_id uuid,
    CONSTRAINT crm_campaigns_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text]))),
    CONSTRAINT crm_campaigns_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'sending'::text, 'sent'::text, 'failed'::text])))
);


--
-- Name: crm_campaigns_claim_due(integer); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ".crm_campaigns_claim_due(p_limit integer) RETURNS SETOF "prj_D5Snfw9QodSQ".crm_campaigns
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY UPDATE crm_campaigns
SET status = 'sending', sent_at = NULL
WHERE id IN (
SELECT due_id FROM (
SELECT id AS due_id FROM crm_campaigns
WHERE status = 'scheduled' AND scheduled_at <= NOW()
ORDER BY scheduled_at
FOR UPDATE SKIP LOCKED
LIMIT p_limit
) due_rows
)
RETURNING *;
END $$;


--
-- Name: crm_delete_pipeline(uuid); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ".crm_delete_pipeline(p_pipeline_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
DELETE FROM crm_opportunities WHERE pipeline_id = p_pipeline_id;
DELETE FROM crm_pipeline_stages WHERE pipeline_id = p_pipeline_id;
DELETE FROM crm_pipelines WHERE id = p_pipeline_id;
END $$;


--
-- Name: crm_flow_step_queue; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_flow_step_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flow_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    resume_step_order integer NOT NULL,
    run_at timestamp with time zone NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 5 NOT NULL,
    last_error text,
    event_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    locked_at timestamp with time zone,
    locked_by text,
    finished_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_flow_queue_claim(integer, text, integer); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ".crm_flow_queue_claim(p_limit integer, p_worker text, p_lock_seconds integer DEFAULT 300) RETURNS SETOF "prj_D5Snfw9QodSQ".crm_flow_step_queue
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY UPDATE crm_flow_step_queue
SET locked_at = NOW(),
locked_by = p_worker,
attempts = attempts + 1
WHERE id IN (
SELECT due_id FROM (
SELECT id AS due_id FROM crm_flow_step_queue
WHERE finished_at IS NULL
AND attempts < max_attempts
AND run_at <= NOW()
AND (locked_at IS NULL OR locked_at < NOW() - make_interval(secs => p_lock_seconds))
ORDER BY run_at
FOR UPDATE SKIP LOCKED
LIMIT p_limit
) due_rows
)
RETURNING *;
END $$;


--
-- Name: crm_goal_work; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_goal_work (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_id uuid,
    kind text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    not_before timestamp with time zone DEFAULT now() NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 5 NOT NULL,
    last_error text,
    locked_at timestamp with time zone,
    locked_by text,
    finished_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT crm_goal_work_kind_check CHECK ((kind = ANY (ARRAY['rematch'::text, 'classify'::text, 'reply'::text, 'evaluate'::text, 'send'::text]))),
    CONSTRAINT crm_goal_work_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'done'::text, 'failed'::text])))
);


--
-- Name: crm_goal_work_claim(integer, text, integer); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ".crm_goal_work_claim(p_limit integer, p_worker text, p_lock_seconds integer DEFAULT 300) RETURNS SETOF "prj_D5Snfw9QodSQ".crm_goal_work
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY UPDATE crm_goal_work
SET locked_at = NOW(),
locked_by = p_worker,
status = 'processing',
attempts = attempts + 1
WHERE id IN (
SELECT due_id FROM (
SELECT id AS due_id FROM crm_goal_work
WHERE finished_at IS NULL
AND status IN ('pending', 'processing')
AND attempts < max_attempts
AND not_before <= NOW()
AND (locked_at IS NULL OR locked_at < NOW() - make_interval(secs => p_lock_seconds))
ORDER BY not_before
FOR UPDATE SKIP LOCKED
LIMIT p_limit
) due_rows
)
RETURNING *;
END $$;


--
-- Name: crm_retype_stage(uuid, text); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ".crm_retype_stage(p_stage_id uuid, p_new_type text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
v_status TEXT := CASE WHEN p_new_type = 'won' THEN 'won' WHEN p_new_type = 'lost' THEN 'lost' ELSE 'open' END;
BEGIN
UPDATE crm_pipeline_stages SET type = p_new_type, updated_at = NOW() WHERE id = p_stage_id;
UPDATE crm_opportunities SET
status = v_status,
won_at = CASE WHEN v_status = 'won' THEN NOW() ELSE NULL END,
lost_at = CASE WHEN v_status = 'lost' THEN NOW() ELSE NULL END,
updated_at = NOW()
WHERE stage_id = p_stage_id;
END $$;


--
-- Name: crm_sends; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_sends (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_id uuid,
    campaign_id uuid,
    flow_id uuid,
    contact_id uuid,
    direction text DEFAULT 'outbound'::text NOT NULL,
    source text,
    created_by text,
    status text DEFAULT 'draft'::text NOT NULL,
    to_email text,
    from_email text,
    subject text,
    body text,
    draft_body text,
    approved_by text,
    approved_at timestamp with time zone,
    mailgun_message_id text,
    in_reply_to text,
    thread_references text,
    idempotency_key text,
    error text,
    metadata jsonb DEFAULT '{}'::jsonb,
    sent_at timestamp with time zone,
    locked_at timestamp with time zone,
    locked_by text,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 5 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_sends_direction_check CHECK ((direction = ANY (ARRAY['outbound'::text, 'inbound'::text]))),
    CONSTRAINT crm_sends_source_check CHECK ((source = ANY (ARRAY['campaign'::text, 'flow'::text, 'reply'::text, 'manual'::text]))),
    CONSTRAINT crm_sends_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending_approval'::text, 'approved'::text, 'sending'::text, 'sent'::text, 'failed'::text, 'cancelled'::text, 'received'::text])))
);


--
-- Name: crm_sends_claim_due(integer, text, integer); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ".crm_sends_claim_due(p_limit integer, p_worker text, p_lock_seconds integer DEFAULT 300) RETURNS SETOF "prj_D5Snfw9QodSQ".crm_sends
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY UPDATE crm_sends
SET status = 'sending',
locked_at = NOW(),
locked_by = p_worker,
attempts = attempts + 1
WHERE id IN (
SELECT due_id FROM (
SELECT id AS due_id FROM crm_sends
WHERE direction = 'outbound'
AND status = 'approved'
AND attempts < max_attempts
AND (locked_at IS NULL OR locked_at < NOW() - make_interval(secs => p_lock_seconds))
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT p_limit
) due_rows
)
RETURNING *;
END $$;


--
-- Name: delete_project(text); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ".delete_project(p_id text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
deleted_count integer;
BEGIN
IF NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid IS NULL THEN
RETURN false;
END IF;
DELETE FROM "prj_D5Snfw9QodSQ".projects
WHERE id = p_id AND user_id = NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RETURN deleted_count > 0;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ".handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
insert into "prj_D5Snfw9QodSQ".profiles (id, email, name)
values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''))
on conflict (id) do nothing;
return new;
end;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ".is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
SELECT EXISTS (SELECT 1 FROM "prj_D5Snfw9QodSQ".profiles WHERE id = NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid AND role = 'admin');
$$;


--
-- Name: auth_uid(); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ_auth".auth_uid() RETURNS uuid
    LANGUAGE sql
    AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;


--
-- Name: role(); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ_auth".role() RETURNS text
    LANGUAGE sql
    AS $$
  SELECT COALESCE(current_setting('request.jwt.claim.role', true), 'anon')
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

CREATE FUNCTION "prj_D5Snfw9QodSQ_storage".foldername(name text) RETURNS text[]
    LANGUAGE sql IMMUTABLE
    AS $$
  SELECT string_to_array(name, '/')
$$;


--
-- Name: crm_appointments; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    calendar_id uuid,
    contact_id uuid,
    contact_email text NOT NULL,
    contact_name text,
    contact_phone text,
    title text,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    status text DEFAULT 'confirmed'::text,
    notes text,
    source text DEFAULT 'manual'::text,
    google_event_id text,
    calendly_event_id text,
    assigned_user_id text,
    assigned_membership_id uuid,
    participant_count integer DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_appointments_source_check CHECK ((source = ANY (ARRAY['manual'::text, 'public_link'::text, 'google'::text, 'calendly'::text]))),
    CONSTRAINT crm_appointments_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'cancelled'::text, 'completed'::text, 'no_show'::text, 'rescheduled'::text])))
);


--
-- Name: crm_availability; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    calendar_id uuid,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_availability_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: crm_calendar_members; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_calendar_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    calendar_id uuid,
    user_id text NOT NULL,
    user_google_calendar_id text,
    user_outlook_calendar_id text,
    priority integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_calendars; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_calendars (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text DEFAULT 'Default Calendar'::text NOT NULL,
    slug text,
    description text,
    calendar_type text DEFAULT 'personal'::text,
    owner_user_id text,
    max_participants integer DEFAULT 1,
    date_range_days integer,
    slot_duration integer DEFAULT 30,
    slot_interval integer DEFAULT 0,
    max_bookings_per_day integer,
    min_notice_hours integer DEFAULT 1,
    buffer_before integer DEFAULT 0,
    buffer_after integer DEFAULT 0,
    timezone text DEFAULT 'America/New_York'::text,
    is_active boolean DEFAULT true,
    meeting_location_type text DEFAULT 'custom'::text,
    meeting_location_value text,
    host_notify_on_booking boolean DEFAULT true,
    google_calendar_id text,
    google_refresh_token text,
    calendly_user_uri text,
    calendly_webhook_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    calendly_connection_id uuid,
    CONSTRAINT crm_calendars_calendar_type_check CHECK ((calendar_type = ANY (ARRAY['personal'::text, 'round_robin'::text, 'class'::text, 'collective'::text])))
);


--
-- Name: crm_calendly_connections; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_calendly_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    calendly_user_uri text NOT NULL,
    calendly_user_email text,
    calendly_user_name text,
    calendly_org_uri text,
    encrypted_access_token text NOT NULL,
    signing_key text NOT NULL,
    webhook_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_contact_lists; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_contact_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contact_id uuid NOT NULL,
    list_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_contacts; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    name text,
    phone text,
    sms_opt_in boolean DEFAULT false,
    address jsonb,
    source text DEFAULT 'manual'::text,
    tags text[] DEFAULT '{}'::text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    ecom_customer_id uuid,
    total_orders integer DEFAULT 0,
    total_spent integer DEFAULT 0,
    last_order_at timestamp with time zone,
    first_order_at timestamp with time zone,
    purchased_product_ids text[] DEFAULT '{}'::text[],
    purchased_product_names text[] DEFAULT '{}'::text[],
    subscribed boolean DEFAULT true,
    subscribed_at timestamp with time zone DEFAULT now(),
    unsubscribed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_events; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contact_id uuid,
    campaign_id uuid,
    channel text DEFAULT 'email'::text NOT NULL,
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    goal_id uuid,
    flow_id uuid,
    send_id uuid,
    event_key text,
    CONSTRAINT crm_events_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text]))),
    CONSTRAINT crm_events_event_type_check CHECK ((event_type = ANY (ARRAY['sent'::text, 'opened'::text, 'clicked'::text, 'bounced'::text, 'unsubscribed'::text, 'opt_out'::text, 'delivered'::text, 'failed'::text, 'undelivered'::text, 'replied'::text, 'converted'::text])))
);


--
-- Name: crm_flow_logs; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_flow_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flow_id uuid,
    step_id uuid,
    contact_id uuid,
    trigger_event text NOT NULL,
    status text DEFAULT 'executed'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_flow_logs_status_check CHECK ((status = ANY (ARRAY['executed'::text, 'failed'::text, 'skipped'::text])))
);


--
-- Name: crm_flow_steps; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_flow_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flow_id uuid,
    step_order integer NOT NULL,
    action_type text NOT NULL,
    action_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_flow_steps_action_type_check CHECK ((action_type = ANY (ARRAY['send_email'::text, 'send_sms'::text, 'add_tag'::text, 'add_to_list'::text, 'wait'::text, 'create_opportunity'::text, 'move_opportunity_stage'::text, 'update_opportunity'::text])))
);


--
-- Name: crm_flows; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_flows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    trigger_type text NOT NULL,
    trigger_config jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    cron_job_name text,
    last_fired_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    goal_id uuid,
    CONSTRAINT crm_flows_trigger_type_check CHECK ((trigger_type = ANY (ARRAY[(('contact'::text || chr(46)) || 'subscribed'::text), (('order'::text || chr(46)) || 'placed'::text), (('contact'::text || chr(46)) || 'tagged'::text), (('user'::text || chr(46)) || 'registered'::text), (('appointment'::text || chr(46)) || 'booked'::text), (('schedule'::text || chr(46)) || 'cron'::text), (('opportunity'::text || chr(46)) || 'created'::text), (('opportunity'::text || chr(46)) || 'stage_changed'::text), (('opportunity'::text || chr(46)) || 'won'::text), (('opportunity'::text || chr(46)) || 'lost'::text)])))
);


--
-- Name: crm_goal_actions; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_goal_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_id uuid NOT NULL,
    action_type text NOT NULL,
    target_table text,
    target_id uuid,
    status text DEFAULT 'created'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: crm_goal_contacts; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_goal_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    conversation_state text DEFAULT 'ai_active'::text NOT NULL,
    matched_at timestamp with time zone DEFAULT now(),
    last_touched_at timestamp with time zone,
    converted_at timestamp with time zone,
    conversion_reason text,
    messages_sent integer DEFAULT 0 NOT NULL,
    replies_received integer DEFAULT 0 NOT NULL,
    insights jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_goal_contacts_convstate_check CHECK ((conversation_state = ANY (ARRAY['ai_active'::text, 'paused'::text, 'human'::text]))),
    CONSTRAINT crm_goal_contacts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'converted'::text, 'exited'::text, 'suppressed'::text])))
);


--
-- Name: crm_goal_runs; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_goal_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_id uuid NOT NULL,
    run_type text DEFAULT 'plan'::text NOT NULL,
    status text DEFAULT 'running'::text NOT NULL,
    selection_stats jsonb DEFAULT '{}'::jsonb,
    processing_stats jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    error text,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_goal_runs_status_check CHECK ((status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text]))),
    CONSTRAINT crm_goal_runs_type_check CHECK ((run_type = ANY (ARRAY['plan'::text, 'tick'::text, 'classify'::text, 'reply'::text, 'evaluate'::text])))
);


--
-- Name: crm_goals; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    objective_text text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    category text,
    tags text[] DEFAULT '{}'::text[],
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    success_criteria jsonb DEFAULT '{}'::jsonb,
    plan jsonb DEFAULT '{}'::jsonb,
    rules jsonb DEFAULT '{}'::jsonb,
    instructions text,
    sender jsonb DEFAULT '{}'::jsonb,
    created_by text,
    last_run_at timestamp with time zone,
    last_processed_at timestamp with time zone,
    last_contact_match_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_goals_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'planning'::text, 'needs_approval'::text, 'active'::text, 'paused'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: crm_lists; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    filter_query jsonb,
    is_dynamic boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    goal_id uuid
);


--
-- Name: crm_opportunities; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_opportunities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contact_id uuid,
    pipeline_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    title text NOT NULL,
    value_cents integer DEFAULT 0,
    currency text DEFAULT 'usd'::text,
    status text DEFAULT 'open'::text NOT NULL,
    "position" integer DEFAULT 0,
    source text,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    won_at timestamp with time zone,
    lost_at timestamp with time zone,
    lost_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_opportunities_status_check CHECK ((status = ANY (ARRAY['open'::text, 'won'::text, 'lost'::text])))
);


--
-- Name: crm_opportunity_events; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_opportunity_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    opportunity_id uuid NOT NULL,
    contact_id uuid,
    pipeline_id uuid,
    from_stage_id uuid,
    to_stage_id uuid,
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_opportunity_events_type_check CHECK ((event_type = ANY (ARRAY['created'::text, 'stage_changed'::text, 'won'::text, 'lost'::text])))
);


--
-- Name: crm_pipeline_stages; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_pipeline_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pipeline_id uuid NOT NULL,
    name text NOT NULL,
    "position" integer DEFAULT 0,
    type text DEFAULT 'open'::text NOT NULL,
    color text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_pipeline_stages_type_check CHECK ((type = ANY (ARRAY['open'::text, 'won'::text, 'lost'::text])))
);


--
-- Name: crm_pipelines; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".crm_pipelines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "position" integer DEFAULT 0,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".profiles (
    id uuid NOT NULL,
    email text,
    name text,
    plan text DEFAULT 'enterprise'::text NOT NULL,
    credits integer DEFAULT 788 NOT NULL,
    approved_ids text[] DEFAULT '{}'::text[] NOT NULL,
    generated_docs text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    projects_seeded boolean DEFAULT false
);


--
-- Name: project_documents; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".project_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_key text NOT NULL,
    project_id text NOT NULL,
    name text NOT NULL,
    folder text DEFAULT 'General'::text NOT NULL,
    ext text DEFAULT ''::text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    storage_path text,
    archived boolean DEFAULT false NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    current_version text DEFAULT '1.0'::text NOT NULL,
    versions jsonb DEFAULT '[]'::jsonb NOT NULL,
    ai_meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ".projects (
    id text NOT NULL,
    user_id uuid NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted boolean DEFAULT false NOT NULL
);


--
-- Name: identities; Type: TABLE; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ_auth".identities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    provider text NOT NULL,
    identity_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ_auth".users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    encrypted_password text,
    email_confirmed_at timestamp with time zone,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
    is_anonymous boolean DEFAULT false,
    phone_confirmed_at timestamp with time zone,
    confirmation_token text,
    confirmation_sent_at timestamp with time zone,
    recovery_token text,
    recovery_sent_at timestamp with time zone
);


--
-- Name: buckets; Type: TABLE; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ_storage".buckets (
    id text NOT NULL,
    name text NOT NULL,
    public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    file_size_limit bigint,
    allowed_mime_types text[]
);


--
-- Name: objects; Type: TABLE; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

CREATE TABLE "prj_D5Snfw9QodSQ_storage".objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    path_tokens text[],
    version text
);


--
-- Data for Name: crm_appointments; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_appointments (id, calendar_id, contact_id, contact_email, contact_name, contact_phone, title, starts_at, ends_at, status, notes, source, google_event_id, calendly_event_id, assigned_user_id, assigned_membership_id, participant_count, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_availability; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_availability (id, calendar_id, day_of_week, start_time, end_time, is_active, created_at) FROM stdin;
b89d38c9-0d61-43cb-a797-39c6e4d63722	a4507720-045e-4642-ad1b-9a8be0cf020c	1	09:00:00	17:00:00	t	2026-07-17 01:49:04.419335+00
925f3b33-b183-4143-b448-cacd9018e0a5	a4507720-045e-4642-ad1b-9a8be0cf020c	2	09:00:00	17:00:00	t	2026-07-17 01:49:04.419335+00
e40b9f9b-53a5-483e-a040-3cb3d81496bc	a4507720-045e-4642-ad1b-9a8be0cf020c	3	09:00:00	17:00:00	t	2026-07-17 01:49:04.419335+00
db407d27-2a07-49d3-9bbf-61c94ab9ed15	a4507720-045e-4642-ad1b-9a8be0cf020c	4	09:00:00	17:00:00	t	2026-07-17 01:49:04.419335+00
64754e38-d886-46bd-93c3-bcb4260a1f46	a4507720-045e-4642-ad1b-9a8be0cf020c	5	09:00:00	17:00:00	t	2026-07-17 01:49:04.419335+00
\.


--
-- Data for Name: crm_calendar_members; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_calendar_members (id, calendar_id, user_id, user_google_calendar_id, user_outlook_calendar_id, priority, created_at) FROM stdin;
90155374-9b2e-43f6-b0c6-ad7c1bd258f9	a4507720-045e-4642-ad1b-9a8be0cf020c	6a59872b382d3920fcf53684	\N	\N	0	2026-07-17 01:49:04.325381+00
\.


--
-- Data for Name: crm_calendars; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_calendars (id, name, slug, description, calendar_type, owner_user_id, max_participants, date_range_days, slot_duration, slot_interval, max_bookings_per_day, min_notice_hours, buffer_before, buffer_after, timezone, is_active, meeting_location_type, meeting_location_value, host_notify_on_booking, google_calendar_id, google_refresh_token, calendly_user_uri, calendly_webhook_id, metadata, created_at, updated_at, calendly_connection_id) FROM stdin;
a4507720-045e-4642-ad1b-9a8be0cf020c	Default Calendar	\N	\N	personal	6a59872b382d3920fcf53684	1	\N	30	0	\N	1	0	0	America/New_York	t	custom	\N	t	\N	\N	\N	\N	{}	2026-07-17 01:49:04.234757+00	2026-07-17 01:49:04.234757+00	\N
\.


--
-- Data for Name: crm_calendly_connections; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_calendly_connections (id, user_id, calendly_user_uri, calendly_user_email, calendly_user_name, calendly_org_uri, encrypted_access_token, signing_key, webhook_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_campaigns; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_campaigns (id, name, subject, html_body, text_body, channel, status, list_id, filter_query, list_ids, style_preset, images, scheduled_at, sent_at, total_recipients, total_sent, total_opened, total_clicked, created_at, goal_id) FROM stdin;
\.


--
-- Data for Name: crm_contact_lists; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_contact_lists (id, contact_id, list_id, created_at) FROM stdin;
\.


--
-- Data for Name: crm_contacts; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_contacts (id, email, name, phone, sms_opt_in, address, source, tags, metadata, ecom_customer_id, total_orders, total_spent, last_order_at, first_order_at, purchased_product_ids, purchased_product_names, subscribed, subscribed_at, unsubscribed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_events; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_events (id, contact_id, campaign_id, channel, event_type, metadata, created_at, goal_id, flow_id, send_id, event_key) FROM stdin;
\.


--
-- Data for Name: crm_flow_logs; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_flow_logs (id, flow_id, step_id, contact_id, trigger_event, status, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: crm_flow_step_queue; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_flow_step_queue (id, flow_id, contact_id, resume_step_order, run_at, attempts, max_attempts, last_error, event_data, locked_at, locked_by, finished_at, created_at) FROM stdin;
\.


--
-- Data for Name: crm_flow_steps; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_flow_steps (id, flow_id, step_order, action_type, action_config, created_at) FROM stdin;
\.


--
-- Data for Name: crm_flows; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_flows (id, name, trigger_type, trigger_config, is_active, cron_job_name, last_fired_at, created_at, updated_at, goal_id) FROM stdin;
764a30f0-e498-475c-9f2e-d375a51e6174	Welcome Email	contact.subscribed	{}	f	\N	\N	2026-07-17 01:49:03.997688+00	2026-07-17 01:49:03.997688+00	\N
\.


--
-- Data for Name: crm_goal_actions; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_goal_actions (id, goal_id, action_type, target_table, target_id, status, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: crm_goal_contacts; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_goal_contacts (id, goal_id, contact_id, status, conversation_state, matched_at, last_touched_at, converted_at, conversion_reason, messages_sent, replies_received, insights, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_goal_runs; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_goal_runs (id, goal_id, run_type, status, selection_stats, processing_stats, metadata, error, started_at, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: crm_goal_work; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_goal_work (id, goal_id, kind, payload, status, not_before, attempts, max_attempts, last_error, locked_at, locked_by, finished_at, created_at) FROM stdin;
\.


--
-- Data for Name: crm_goals; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_goals (id, objective_text, status, category, tags, config, success_criteria, plan, rules, instructions, sender, created_by, last_run_at, last_processed_at, last_contact_match_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_lists; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_lists (id, name, description, filter_query, is_dynamic, created_at, goal_id) FROM stdin;
\.


--
-- Data for Name: crm_opportunities; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_opportunities (id, contact_id, pipeline_id, stage_id, title, value_cents, currency, status, "position", source, description, metadata, won_at, lost_at, lost_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_opportunity_events; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_opportunity_events (id, opportunity_id, contact_id, pipeline_id, from_stage_id, to_stage_id, event_type, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: crm_pipeline_stages; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_pipeline_stages (id, pipeline_id, name, "position", type, color, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_pipelines; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_pipelines (id, name, "position", is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_sends; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".crm_sends (id, goal_id, campaign_id, flow_id, contact_id, direction, source, created_by, status, to_email, from_email, subject, body, draft_body, approved_by, approved_at, mailgun_message_id, in_reply_to, thread_references, idempotency_key, error, metadata, sent_at, locked_at, locked_by, attempts, max_attempts, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".profiles (id, email, name, plan, credits, approved_ids, generated_docs, created_at, updated_at, role, projects_seeded) FROM stdin;
c59d44f4-104b-4106-ad68-2aff5b53ed33	admin@projectatlas.ai	Atlas Admin	enterprise	9999	{}	{}	2026-07-17 02:31:02.653519+00	2026-07-17 02:31:02.653519+00	admin	f
26258ea2-dd89-46d8-a6f3-c88d005f94ca	tester@projectatlas.ai	Atlas Tester	enterprise	1000	{a1,a2,a3,a4,a5}	{}	2026-07-17 02:31:03.181215+00	2026-07-17 04:49:37.657+00	tester	t
\.


--
-- Data for Name: project_documents; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".project_documents (id, owner_key, project_id, name, folder, ext, size, storage_path, archived, deleted, current_version, versions, ai_meta, created_at, updated_at) FROM stdin;
f14f8041-8f85-405c-9999-f82a8f55c40b	26258ea2-dd89-46d8-a6f3-c88d005f94ca	p-1784262090026	Survey Monkey.pdf	Surveys	pdf	485946	26258ea2-dd89-46d8-a6f3-c88d005f94ca/p-1784262090026/1784267017799-pjdoig-Survey_Monkey.pdf	f	f	1.0	[{"note": "Original upload", "size": 485946, "version": "1.0", "createdAt": "2026-07-17T05:43:38.395Z", "storagePath": "26258ea2-dd89-46d8-a6f3-c88d005f94ca/p-1784262090026/1784267017799-pjdoig-Survey_Monkey.pdf"}]	{"topics": ["Consumer Habits", "Product-Market Fit", "Feature Prioritization", "Willingness to Pay", "User Demographics"], "docType": "Survey Results", "keyData": ["Net Promoter Score (NPS) for concept", "Top 3 desired smart features", "Target price point distribution", "Current solution dissatisfaction rate"], "purpose": "To capture and analyze consumer sentiment, pain points, and feature preferences regarding the Rise Jar concept.", "relevance": "Provides the primary market validation data required to transition Rise Jar from the Idea stage to the Design and Prototype stages."}	2026-07-17 05:43:38.395+00	2026-07-17 05:43:41.678+00
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ; Owner: -
--

COPY "prj_D5Snfw9QodSQ".projects (id, user_id, data, created_at, updated_at, deleted) FROM stdin;
p-1784262090026	26258ea2-dd89-46d8-a6f3-c88d005f94ca	{"id": "p-1784262090026", "name": "Rise Jar", "risk": 50, "image": "https://d64gsuwffb70l.cloudfront.net/6a598a00382d3920fcf5791a_1784253081675_941bc533.png", "health": 55, "tagline": "Create a new invention project called **Rise Jar**.\\n\\nThis is a new invention tha", "updated": "Just now", "activity": "Validation & patent research kicked off", "archived": false, "favorite": true, "stageIndex": 0, "estCompletion": "TBD", "nextMilestone": "First validation report — within 1 hour"}	2026-07-17 04:21:30.123285+00	2026-07-17 04:25:53.033+00	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

COPY "prj_D5Snfw9QodSQ_auth".identities (id, user_id, provider, identity_data, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

COPY "prj_D5Snfw9QodSQ_auth".users (id, email, encrypted_password, email_confirmed_at, phone, created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_anonymous, phone_confirmed_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at) FROM stdin;
c59d44f4-104b-4106-ad68-2aff5b53ed33	admin@projectatlas.ai	$2b$10$W0YlEdY.LvZ/nFCR/aXf/.iDhn5PSUSYHbeDmBCsu2Vy6K5XRh.tK	2026-07-17 02:31:02.404+00	\N	2026-07-17 02:31:02.404+00	2026-07-17 02:31:56.277+00	2026-07-17 02:31:56.277+00	{"provider": "email", "providers": ["email"]}	{"name": "Atlas Admin"}	f	\N	\N	\N	\N	\N
26258ea2-dd89-46d8-a6f3-c88d005f94ca	tester@projectatlas.ai	$2b$10$1yXpJUf11qkt6b07fq0ynOngI2KJ78pSPQbSv6/vuv.V6uIVu7cuG	2026-07-17 02:31:02.931+00	\N	2026-07-17 02:31:02.931+00	2026-07-17 05:15:13.259+00	2026-07-17 05:15:13.259+00	{"provider": "email", "providers": ["email"]}	{"name": "Atlas Tester"}	f	\N	\N	\N	\N	\N
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

COPY "prj_D5Snfw9QodSQ_storage".buckets (id, name, public, created_at, updated_at, file_size_limit, allowed_mime_types) FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

COPY "prj_D5Snfw9QodSQ_storage".objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, path_tokens, version) FROM stdin;
\.


--
-- Name: crm_appointments crm_appointments_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_appointments
    ADD CONSTRAINT crm_appointments_pkey PRIMARY KEY (id);


--
-- Name: crm_availability crm_availability_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_availability
    ADD CONSTRAINT crm_availability_pkey PRIMARY KEY (id);


--
-- Name: crm_calendar_members crm_calendar_members_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_calendar_members
    ADD CONSTRAINT crm_calendar_members_pkey PRIMARY KEY (id);


--
-- Name: crm_calendars crm_calendars_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_calendars
    ADD CONSTRAINT crm_calendars_pkey PRIMARY KEY (id);


--
-- Name: crm_calendly_connections crm_calendly_connections_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_calendly_connections
    ADD CONSTRAINT crm_calendly_connections_pkey PRIMARY KEY (id);


--
-- Name: crm_campaigns crm_campaigns_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_campaigns
    ADD CONSTRAINT crm_campaigns_pkey PRIMARY KEY (id);


--
-- Name: crm_contact_lists crm_contact_lists_contact_id_list_id_key; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_contact_lists
    ADD CONSTRAINT crm_contact_lists_contact_id_list_id_key UNIQUE (contact_id, list_id);


--
-- Name: crm_contact_lists crm_contact_lists_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_contact_lists
    ADD CONSTRAINT crm_contact_lists_pkey PRIMARY KEY (id);


--
-- Name: crm_contacts crm_contacts_email_key; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_contacts
    ADD CONSTRAINT crm_contacts_email_key UNIQUE (email);


--
-- Name: crm_contacts crm_contacts_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_contacts
    ADD CONSTRAINT crm_contacts_pkey PRIMARY KEY (id);


--
-- Name: crm_events crm_events_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_events
    ADD CONSTRAINT crm_events_pkey PRIMARY KEY (id);


--
-- Name: crm_flow_logs crm_flow_logs_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flow_logs
    ADD CONSTRAINT crm_flow_logs_pkey PRIMARY KEY (id);


--
-- Name: crm_flow_step_queue crm_flow_step_queue_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flow_step_queue
    ADD CONSTRAINT crm_flow_step_queue_pkey PRIMARY KEY (id);


--
-- Name: crm_flow_steps crm_flow_steps_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flow_steps
    ADD CONSTRAINT crm_flow_steps_pkey PRIMARY KEY (id);


--
-- Name: crm_flows crm_flows_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flows
    ADD CONSTRAINT crm_flows_pkey PRIMARY KEY (id);


--
-- Name: crm_goal_actions crm_goal_actions_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_actions
    ADD CONSTRAINT crm_goal_actions_pkey PRIMARY KEY (id);


--
-- Name: crm_goal_contacts crm_goal_contacts_goal_id_contact_id_key; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_contacts
    ADD CONSTRAINT crm_goal_contacts_goal_id_contact_id_key UNIQUE (goal_id, contact_id);


--
-- Name: crm_goal_contacts crm_goal_contacts_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_contacts
    ADD CONSTRAINT crm_goal_contacts_pkey PRIMARY KEY (id);


--
-- Name: crm_goal_runs crm_goal_runs_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_runs
    ADD CONSTRAINT crm_goal_runs_pkey PRIMARY KEY (id);


--
-- Name: crm_goal_work crm_goal_work_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_work
    ADD CONSTRAINT crm_goal_work_pkey PRIMARY KEY (id);


--
-- Name: crm_goals crm_goals_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goals
    ADD CONSTRAINT crm_goals_pkey PRIMARY KEY (id);


--
-- Name: crm_lists crm_lists_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_lists
    ADD CONSTRAINT crm_lists_pkey PRIMARY KEY (id);


--
-- Name: crm_opportunities crm_opportunities_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_opportunities
    ADD CONSTRAINT crm_opportunities_pkey PRIMARY KEY (id);


--
-- Name: crm_opportunity_events crm_opportunity_events_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_opportunity_events
    ADD CONSTRAINT crm_opportunity_events_pkey PRIMARY KEY (id);


--
-- Name: crm_pipeline_stages crm_pipeline_stages_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_pipeline_stages
    ADD CONSTRAINT crm_pipeline_stages_pkey PRIMARY KEY (id);


--
-- Name: crm_pipelines crm_pipelines_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_pipelines
    ADD CONSTRAINT crm_pipelines_pkey PRIMARY KEY (id);


--
-- Name: crm_sends crm_sends_idempotency_key_key; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_sends
    ADD CONSTRAINT crm_sends_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: crm_sends crm_sends_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_sends
    ADD CONSTRAINT crm_sends_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: project_documents project_documents_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".project_documents
    ADD CONSTRAINT project_documents_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ_auth".identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ_auth".users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ_auth".users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_name_key; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ_storage".buckets
    ADD CONSTRAINT buckets_name_key UNIQUE (name);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ_storage".buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: objects objects_bucket_id_name_key; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ_storage".objects
    ADD CONSTRAINT objects_bucket_id_name_key UNIQUE (bucket_id, name);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ_storage".objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: crm_calendar_members_calendar_user_unique; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE UNIQUE INDEX crm_calendar_members_calendar_user_unique ON "prj_D5Snfw9QodSQ".crm_calendar_members USING btree (calendar_id, user_id);


--
-- Name: crm_calendars_slug_unique; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE UNIQUE INDEX crm_calendars_slug_unique ON "prj_D5Snfw9QodSQ".crm_calendars USING btree (slug) WHERE (slug IS NOT NULL);


--
-- Name: crm_calendly_connections_user_uri_unique; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE UNIQUE INDEX crm_calendly_connections_user_uri_unique ON "prj_D5Snfw9QodSQ".crm_calendly_connections USING btree (user_id, calendly_user_uri);


--
-- Name: crm_events_channel_event_type_created_idx; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX crm_events_channel_event_type_created_idx ON "prj_D5Snfw9QodSQ".crm_events USING btree (channel, event_type, created_at DESC);


--
-- Name: crm_events_contact_channel_event_type_idx; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX crm_events_contact_channel_event_type_idx ON "prj_D5Snfw9QodSQ".crm_events USING btree (contact_id, channel, event_type);


--
-- Name: crm_pipeline_stages_one_lost; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE UNIQUE INDEX crm_pipeline_stages_one_lost ON "prj_D5Snfw9QodSQ".crm_pipeline_stages USING btree (pipeline_id) WHERE (type = 'lost'::text);


--
-- Name: crm_pipeline_stages_one_won; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE UNIQUE INDEX crm_pipeline_stages_one_won ON "prj_D5Snfw9QodSQ".crm_pipeline_stages USING btree (pipeline_id) WHERE (type = 'won'::text);


--
-- Name: crm_pipelines_one_default; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE UNIQUE INDEX crm_pipelines_one_default ON "prj_D5Snfw9QodSQ".crm_pipelines USING btree (is_default) WHERE is_default;


--
-- Name: idx_crm_appointments_assigned_user_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_appointments_assigned_user_id ON "prj_D5Snfw9QodSQ".crm_appointments USING btree (assigned_user_id);


--
-- Name: idx_crm_appointments_calendar_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_appointments_calendar_id ON "prj_D5Snfw9QodSQ".crm_appointments USING btree (calendar_id);


--
-- Name: idx_crm_appointments_contact_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_appointments_contact_id ON "prj_D5Snfw9QodSQ".crm_appointments USING btree (contact_id);


--
-- Name: idx_crm_appointments_starts_at; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_appointments_starts_at ON "prj_D5Snfw9QodSQ".crm_appointments USING btree (starts_at);


--
-- Name: idx_crm_appointments_status; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_appointments_status ON "prj_D5Snfw9QodSQ".crm_appointments USING btree (status);


--
-- Name: idx_crm_availability_calendar_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_availability_calendar_id ON "prj_D5Snfw9QodSQ".crm_availability USING btree (calendar_id);


--
-- Name: idx_crm_calendar_members_calendar_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_calendar_members_calendar_id ON "prj_D5Snfw9QodSQ".crm_calendar_members USING btree (calendar_id);


--
-- Name: idx_crm_calendar_members_user_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_calendar_members_user_id ON "prj_D5Snfw9QodSQ".crm_calendar_members USING btree (user_id);


--
-- Name: idx_crm_calendars_calendly_connection; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_calendars_calendly_connection ON "prj_D5Snfw9QodSQ".crm_calendars USING btree (calendly_connection_id) WHERE (calendly_connection_id IS NOT NULL);


--
-- Name: idx_crm_calendars_is_active; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_calendars_is_active ON "prj_D5Snfw9QodSQ".crm_calendars USING btree (is_active);


--
-- Name: idx_crm_calendars_owner_user_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_calendars_owner_user_id ON "prj_D5Snfw9QodSQ".crm_calendars USING btree (owner_user_id);


--
-- Name: idx_crm_calendly_connections_user_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_calendly_connections_user_id ON "prj_D5Snfw9QodSQ".crm_calendly_connections USING btree (user_id);


--
-- Name: idx_crm_campaigns_created_at; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_campaigns_created_at ON "prj_D5Snfw9QodSQ".crm_campaigns USING btree (created_at);


--
-- Name: idx_crm_campaigns_goal_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_campaigns_goal_id ON "prj_D5Snfw9QodSQ".crm_campaigns USING btree (goal_id);


--
-- Name: idx_crm_campaigns_status; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_campaigns_status ON "prj_D5Snfw9QodSQ".crm_campaigns USING btree (status);


--
-- Name: idx_crm_contact_lists_contact_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_contact_lists_contact_id ON "prj_D5Snfw9QodSQ".crm_contact_lists USING btree (contact_id);


--
-- Name: idx_crm_contact_lists_list_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_contact_lists_list_id ON "prj_D5Snfw9QodSQ".crm_contact_lists USING btree (list_id);


--
-- Name: idx_crm_contacts_created_at; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_contacts_created_at ON "prj_D5Snfw9QodSQ".crm_contacts USING btree (created_at);


--
-- Name: idx_crm_contacts_email; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE UNIQUE INDEX idx_crm_contacts_email ON "prj_D5Snfw9QodSQ".crm_contacts USING btree (email);


--
-- Name: idx_crm_contacts_purchased_product_ids; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_contacts_purchased_product_ids ON "prj_D5Snfw9QodSQ".crm_contacts USING gin (purchased_product_ids);


--
-- Name: idx_crm_contacts_purchased_product_names; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_contacts_purchased_product_names ON "prj_D5Snfw9QodSQ".crm_contacts USING gin (purchased_product_names);


--
-- Name: idx_crm_contacts_source; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_contacts_source ON "prj_D5Snfw9QodSQ".crm_contacts USING btree (source);


--
-- Name: idx_crm_contacts_subscribed; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_contacts_subscribed ON "prj_D5Snfw9QodSQ".crm_contacts USING btree (subscribed);


--
-- Name: idx_crm_contacts_tags; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_contacts_tags ON "prj_D5Snfw9QodSQ".crm_contacts USING gin (tags);


--
-- Name: idx_crm_events_campaign_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_events_campaign_id ON "prj_D5Snfw9QodSQ".crm_events USING btree (campaign_id);


--
-- Name: idx_crm_events_channel; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_events_channel ON "prj_D5Snfw9QodSQ".crm_events USING btree (channel);


--
-- Name: idx_crm_events_contact_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_events_contact_id ON "prj_D5Snfw9QodSQ".crm_events USING btree (contact_id);


--
-- Name: idx_crm_events_created_at; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_events_created_at ON "prj_D5Snfw9QodSQ".crm_events USING btree (created_at);


--
-- Name: idx_crm_events_event_key; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE UNIQUE INDEX idx_crm_events_event_key ON "prj_D5Snfw9QodSQ".crm_events USING btree (event_key) WHERE (event_key IS NOT NULL);


--
-- Name: idx_crm_events_event_type; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_events_event_type ON "prj_D5Snfw9QodSQ".crm_events USING btree (event_type);


--
-- Name: idx_crm_events_goal_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_events_goal_id ON "prj_D5Snfw9QodSQ".crm_events USING btree (goal_id);


--
-- Name: idx_crm_events_send_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_events_send_id ON "prj_D5Snfw9QodSQ".crm_events USING btree (send_id);


--
-- Name: idx_crm_flow_logs_contact_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_flow_logs_contact_id ON "prj_D5Snfw9QodSQ".crm_flow_logs USING btree (contact_id);


--
-- Name: idx_crm_flow_logs_created_at; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_flow_logs_created_at ON "prj_D5Snfw9QodSQ".crm_flow_logs USING btree (created_at);


--
-- Name: idx_crm_flow_logs_flow_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_flow_logs_flow_id ON "prj_D5Snfw9QodSQ".crm_flow_logs USING btree (flow_id);


--
-- Name: idx_crm_flow_step_queue_due; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_flow_step_queue_due ON "prj_D5Snfw9QodSQ".crm_flow_step_queue USING btree (run_at) WHERE ((finished_at IS NULL) AND (attempts < max_attempts));


--
-- Name: idx_crm_flow_steps_flow_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_flow_steps_flow_id ON "prj_D5Snfw9QodSQ".crm_flow_steps USING btree (flow_id);


--
-- Name: idx_crm_flows_goal_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_flows_goal_id ON "prj_D5Snfw9QodSQ".crm_flows USING btree (goal_id);


--
-- Name: idx_crm_flows_is_active; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_flows_is_active ON "prj_D5Snfw9QodSQ".crm_flows USING btree (is_active);


--
-- Name: idx_crm_flows_trigger_type; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_flows_trigger_type ON "prj_D5Snfw9QodSQ".crm_flows USING btree (trigger_type);


--
-- Name: idx_crm_goal_actions_goal_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_goal_actions_goal_id ON "prj_D5Snfw9QodSQ".crm_goal_actions USING btree (goal_id);


--
-- Name: idx_crm_goal_contacts_contact_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_goal_contacts_contact_id ON "prj_D5Snfw9QodSQ".crm_goal_contacts USING btree (contact_id);


--
-- Name: idx_crm_goal_contacts_goal_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_goal_contacts_goal_id ON "prj_D5Snfw9QodSQ".crm_goal_contacts USING btree (goal_id);


--
-- Name: idx_crm_goal_contacts_status; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_goal_contacts_status ON "prj_D5Snfw9QodSQ".crm_goal_contacts USING btree (status);


--
-- Name: idx_crm_goal_runs_goal_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_goal_runs_goal_id ON "prj_D5Snfw9QodSQ".crm_goal_runs USING btree (goal_id);


--
-- Name: idx_crm_goal_work_due; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_goal_work_due ON "prj_D5Snfw9QodSQ".crm_goal_work USING btree (not_before) WHERE ((finished_at IS NULL) AND (attempts < max_attempts));


--
-- Name: idx_crm_goals_status; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_goals_status ON "prj_D5Snfw9QodSQ".crm_goals USING btree (status);


--
-- Name: idx_crm_lists_goal_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_lists_goal_id ON "prj_D5Snfw9QodSQ".crm_lists USING btree (goal_id);


--
-- Name: idx_crm_opportunities_contact_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_opportunities_contact_id ON "prj_D5Snfw9QodSQ".crm_opportunities USING btree (contact_id);


--
-- Name: idx_crm_opportunities_created_at; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_opportunities_created_at ON "prj_D5Snfw9QodSQ".crm_opportunities USING btree (created_at);


--
-- Name: idx_crm_opportunities_pipeline_stage; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_opportunities_pipeline_stage ON "prj_D5Snfw9QodSQ".crm_opportunities USING btree (pipeline_id, stage_id);


--
-- Name: idx_crm_opportunities_status; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_opportunities_status ON "prj_D5Snfw9QodSQ".crm_opportunities USING btree (status);


--
-- Name: idx_crm_opportunity_events_opp; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_opportunity_events_opp ON "prj_D5Snfw9QodSQ".crm_opportunity_events USING btree (opportunity_id, created_at);


--
-- Name: idx_crm_pipeline_stages_pipeline_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_pipeline_stages_pipeline_id ON "prj_D5Snfw9QodSQ".crm_pipeline_stages USING btree (pipeline_id);


--
-- Name: idx_crm_sends_campaign_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_sends_campaign_id ON "prj_D5Snfw9QodSQ".crm_sends USING btree (campaign_id);


--
-- Name: idx_crm_sends_contact_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_sends_contact_id ON "prj_D5Snfw9QodSQ".crm_sends USING btree (contact_id);


--
-- Name: idx_crm_sends_goal_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_sends_goal_id ON "prj_D5Snfw9QodSQ".crm_sends USING btree (goal_id);


--
-- Name: idx_crm_sends_in_reply_to; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_sends_in_reply_to ON "prj_D5Snfw9QodSQ".crm_sends USING btree (in_reply_to);


--
-- Name: idx_crm_sends_mailgun_message_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_sends_mailgun_message_id ON "prj_D5Snfw9QodSQ".crm_sends USING btree (mailgun_message_id);


--
-- Name: idx_crm_sends_status; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_crm_sends_status ON "prj_D5Snfw9QodSQ".crm_sends USING btree (status);


--
-- Name: idx_project_documents_owner; Type: INDEX; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE INDEX idx_project_documents_owner ON "prj_D5Snfw9QodSQ".project_documents USING btree (owner_key, project_id);


--
-- Name: idx_identities_user_id; Type: INDEX; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE INDEX idx_identities_user_id ON "prj_D5Snfw9QodSQ_auth".identities USING btree (user_id);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON "prj_D5Snfw9QodSQ_auth".users FOR EACH ROW EXECUTE FUNCTION "prj_D5Snfw9QodSQ".handle_new_user();


--
-- Name: crm_appointments crm_appointments_calendar_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_appointments
    ADD CONSTRAINT crm_appointments_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES "prj_D5Snfw9QodSQ".crm_calendars(id) ON DELETE CASCADE;


--
-- Name: crm_appointments crm_appointments_contact_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_appointments
    ADD CONSTRAINT crm_appointments_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES "prj_D5Snfw9QodSQ".crm_contacts(id) ON DELETE SET NULL;


--
-- Name: crm_availability crm_availability_calendar_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_availability
    ADD CONSTRAINT crm_availability_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES "prj_D5Snfw9QodSQ".crm_calendars(id) ON DELETE CASCADE;


--
-- Name: crm_calendar_members crm_calendar_members_calendar_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_calendar_members
    ADD CONSTRAINT crm_calendar_members_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES "prj_D5Snfw9QodSQ".crm_calendars(id) ON DELETE CASCADE;


--
-- Name: crm_calendars crm_calendars_calendly_connection_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_calendars
    ADD CONSTRAINT crm_calendars_calendly_connection_id_fkey FOREIGN KEY (calendly_connection_id) REFERENCES "prj_D5Snfw9QodSQ".crm_calendly_connections(id) ON DELETE SET NULL;


--
-- Name: crm_campaigns crm_campaigns_list_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_campaigns
    ADD CONSTRAINT crm_campaigns_list_id_fkey FOREIGN KEY (list_id) REFERENCES "prj_D5Snfw9QodSQ".crm_lists(id) ON DELETE SET NULL;


--
-- Name: crm_contact_lists crm_contact_lists_contact_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_contact_lists
    ADD CONSTRAINT crm_contact_lists_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES "prj_D5Snfw9QodSQ".crm_contacts(id) ON DELETE CASCADE;


--
-- Name: crm_contact_lists crm_contact_lists_list_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_contact_lists
    ADD CONSTRAINT crm_contact_lists_list_id_fkey FOREIGN KEY (list_id) REFERENCES "prj_D5Snfw9QodSQ".crm_lists(id) ON DELETE CASCADE;


--
-- Name: crm_events crm_events_campaign_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_events
    ADD CONSTRAINT crm_events_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES "prj_D5Snfw9QodSQ".crm_campaigns(id) ON DELETE CASCADE;


--
-- Name: crm_events crm_events_contact_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_events
    ADD CONSTRAINT crm_events_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES "prj_D5Snfw9QodSQ".crm_contacts(id) ON DELETE CASCADE;


--
-- Name: crm_flow_logs crm_flow_logs_contact_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flow_logs
    ADD CONSTRAINT crm_flow_logs_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES "prj_D5Snfw9QodSQ".crm_contacts(id) ON DELETE CASCADE;


--
-- Name: crm_flow_logs crm_flow_logs_flow_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flow_logs
    ADD CONSTRAINT crm_flow_logs_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES "prj_D5Snfw9QodSQ".crm_flows(id) ON DELETE CASCADE;


--
-- Name: crm_flow_logs crm_flow_logs_step_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flow_logs
    ADD CONSTRAINT crm_flow_logs_step_id_fkey FOREIGN KEY (step_id) REFERENCES "prj_D5Snfw9QodSQ".crm_flow_steps(id) ON DELETE SET NULL;


--
-- Name: crm_flow_step_queue crm_flow_step_queue_contact_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flow_step_queue
    ADD CONSTRAINT crm_flow_step_queue_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES "prj_D5Snfw9QodSQ".crm_contacts(id) ON DELETE CASCADE;


--
-- Name: crm_flow_step_queue crm_flow_step_queue_flow_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flow_step_queue
    ADD CONSTRAINT crm_flow_step_queue_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES "prj_D5Snfw9QodSQ".crm_flows(id) ON DELETE CASCADE;


--
-- Name: crm_flow_steps crm_flow_steps_flow_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_flow_steps
    ADD CONSTRAINT crm_flow_steps_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES "prj_D5Snfw9QodSQ".crm_flows(id) ON DELETE CASCADE;


--
-- Name: crm_goal_actions crm_goal_actions_goal_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_actions
    ADD CONSTRAINT crm_goal_actions_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES "prj_D5Snfw9QodSQ".crm_goals(id) ON DELETE CASCADE;


--
-- Name: crm_goal_contacts crm_goal_contacts_contact_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_contacts
    ADD CONSTRAINT crm_goal_contacts_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES "prj_D5Snfw9QodSQ".crm_contacts(id) ON DELETE CASCADE;


--
-- Name: crm_goal_contacts crm_goal_contacts_goal_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_contacts
    ADD CONSTRAINT crm_goal_contacts_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES "prj_D5Snfw9QodSQ".crm_goals(id) ON DELETE CASCADE;


--
-- Name: crm_goal_runs crm_goal_runs_goal_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_runs
    ADD CONSTRAINT crm_goal_runs_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES "prj_D5Snfw9QodSQ".crm_goals(id) ON DELETE CASCADE;


--
-- Name: crm_goal_work crm_goal_work_goal_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_goal_work
    ADD CONSTRAINT crm_goal_work_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES "prj_D5Snfw9QodSQ".crm_goals(id) ON DELETE CASCADE;


--
-- Name: crm_opportunities crm_opportunities_contact_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_opportunities
    ADD CONSTRAINT crm_opportunities_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES "prj_D5Snfw9QodSQ".crm_contacts(id) ON DELETE SET NULL;


--
-- Name: crm_opportunities crm_opportunities_pipeline_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_opportunities
    ADD CONSTRAINT crm_opportunities_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES "prj_D5Snfw9QodSQ".crm_pipelines(id) ON DELETE CASCADE;


--
-- Name: crm_opportunities crm_opportunities_stage_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_opportunities
    ADD CONSTRAINT crm_opportunities_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES "prj_D5Snfw9QodSQ".crm_pipeline_stages(id) ON DELETE RESTRICT;


--
-- Name: crm_opportunity_events crm_opportunity_events_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_opportunity_events
    ADD CONSTRAINT crm_opportunity_events_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES "prj_D5Snfw9QodSQ".crm_opportunities(id) ON DELETE CASCADE;


--
-- Name: crm_pipeline_stages crm_pipeline_stages_pipeline_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_pipeline_stages
    ADD CONSTRAINT crm_pipeline_stages_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES "prj_D5Snfw9QodSQ".crm_pipelines(id) ON DELETE CASCADE;


--
-- Name: crm_sends crm_sends_campaign_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_sends
    ADD CONSTRAINT crm_sends_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES "prj_D5Snfw9QodSQ".crm_campaigns(id) ON DELETE SET NULL;


--
-- Name: crm_sends crm_sends_contact_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_sends
    ADD CONSTRAINT crm_sends_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES "prj_D5Snfw9QodSQ".crm_contacts(id) ON DELETE CASCADE;


--
-- Name: crm_sends crm_sends_flow_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_sends
    ADD CONSTRAINT crm_sends_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES "prj_D5Snfw9QodSQ".crm_flows(id) ON DELETE SET NULL;


--
-- Name: crm_sends crm_sends_goal_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".crm_sends
    ADD CONSTRAINT crm_sends_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES "prj_D5Snfw9QodSQ".crm_goals(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES "prj_D5Snfw9QodSQ_auth".users(id) ON DELETE CASCADE;


--
-- Name: projects projects_user_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ".projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES "prj_D5Snfw9QodSQ_auth".users(id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ_auth".identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES "prj_D5Snfw9QodSQ_auth".users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucket_id_fkey; Type: FK CONSTRAINT; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

ALTER TABLE ONLY "prj_D5Snfw9QodSQ_storage".objects
    ADD CONSTRAINT objects_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES "prj_D5Snfw9QodSQ_storage".buckets(id) ON DELETE CASCADE;


--
-- Name: profiles Admins can update all profiles; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "Admins can update all profiles" ON "prj_D5Snfw9QodSQ".profiles FOR UPDATE USING ("prj_D5Snfw9QodSQ".is_admin());


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON "prj_D5Snfw9QodSQ".profiles FOR SELECT USING ("prj_D5Snfw9QodSQ".is_admin());


--
-- Name: crm_appointments CRM appointments deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM appointments deletable" ON "prj_D5Snfw9QodSQ".crm_appointments FOR DELETE USING (true);


--
-- Name: crm_appointments CRM appointments insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM appointments insertable" ON "prj_D5Snfw9QodSQ".crm_appointments FOR INSERT WITH CHECK (true);


--
-- Name: crm_appointments CRM appointments readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM appointments readable" ON "prj_D5Snfw9QodSQ".crm_appointments FOR SELECT USING (true);


--
-- Name: crm_appointments CRM appointments updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM appointments updatable" ON "prj_D5Snfw9QodSQ".crm_appointments FOR UPDATE USING (true);


--
-- Name: crm_availability CRM availability deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM availability deletable" ON "prj_D5Snfw9QodSQ".crm_availability FOR DELETE USING (true);


--
-- Name: crm_availability CRM availability insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM availability insertable" ON "prj_D5Snfw9QodSQ".crm_availability FOR INSERT WITH CHECK (true);


--
-- Name: crm_availability CRM availability readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM availability readable" ON "prj_D5Snfw9QodSQ".crm_availability FOR SELECT USING (true);


--
-- Name: crm_availability CRM availability updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM availability updatable" ON "prj_D5Snfw9QodSQ".crm_availability FOR UPDATE USING (true);


--
-- Name: crm_calendar_members CRM calendar members deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM calendar members deletable" ON "prj_D5Snfw9QodSQ".crm_calendar_members FOR DELETE USING (true);


--
-- Name: crm_calendar_members CRM calendar members insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM calendar members insertable" ON "prj_D5Snfw9QodSQ".crm_calendar_members FOR INSERT WITH CHECK (true);


--
-- Name: crm_calendar_members CRM calendar members readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM calendar members readable" ON "prj_D5Snfw9QodSQ".crm_calendar_members FOR SELECT USING (true);


--
-- Name: crm_calendar_members CRM calendar members updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM calendar members updatable" ON "prj_D5Snfw9QodSQ".crm_calendar_members FOR UPDATE USING (true);


--
-- Name: crm_calendars CRM calendars deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM calendars deletable" ON "prj_D5Snfw9QodSQ".crm_calendars FOR DELETE USING (true);


--
-- Name: crm_calendars CRM calendars insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM calendars insertable" ON "prj_D5Snfw9QodSQ".crm_calendars FOR INSERT WITH CHECK (true);


--
-- Name: crm_calendars CRM calendars readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM calendars readable" ON "prj_D5Snfw9QodSQ".crm_calendars FOR SELECT USING (true);


--
-- Name: crm_calendars CRM calendars updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM calendars updatable" ON "prj_D5Snfw9QodSQ".crm_calendars FOR UPDATE USING (true);


--
-- Name: crm_campaigns CRM campaigns deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM campaigns deletable" ON "prj_D5Snfw9QodSQ".crm_campaigns FOR DELETE USING (true);


--
-- Name: crm_campaigns CRM campaigns insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM campaigns insertable" ON "prj_D5Snfw9QodSQ".crm_campaigns FOR INSERT WITH CHECK (true);


--
-- Name: crm_campaigns CRM campaigns readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM campaigns readable" ON "prj_D5Snfw9QodSQ".crm_campaigns FOR SELECT USING (true);


--
-- Name: crm_campaigns CRM campaigns updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM campaigns updatable" ON "prj_D5Snfw9QodSQ".crm_campaigns FOR UPDATE USING (true);


--
-- Name: crm_contact_lists CRM contact lists deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM contact lists deletable" ON "prj_D5Snfw9QodSQ".crm_contact_lists FOR DELETE USING (true);


--
-- Name: crm_contact_lists CRM contact lists insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM contact lists insertable" ON "prj_D5Snfw9QodSQ".crm_contact_lists FOR INSERT WITH CHECK (true);


--
-- Name: crm_contact_lists CRM contact lists readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM contact lists readable" ON "prj_D5Snfw9QodSQ".crm_contact_lists FOR SELECT USING (true);


--
-- Name: crm_contacts CRM contacts deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM contacts deletable" ON "prj_D5Snfw9QodSQ".crm_contacts FOR DELETE USING (true);


--
-- Name: crm_contacts CRM contacts insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM contacts insertable" ON "prj_D5Snfw9QodSQ".crm_contacts FOR INSERT WITH CHECK (true);


--
-- Name: crm_contacts CRM contacts readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM contacts readable" ON "prj_D5Snfw9QodSQ".crm_contacts FOR SELECT USING (true);


--
-- Name: crm_contacts CRM contacts updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM contacts updatable" ON "prj_D5Snfw9QodSQ".crm_contacts FOR UPDATE USING (true);


--
-- Name: crm_events CRM events insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM events insertable" ON "prj_D5Snfw9QodSQ".crm_events FOR INSERT WITH CHECK (true);


--
-- Name: crm_events CRM events readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM events readable" ON "prj_D5Snfw9QodSQ".crm_events FOR SELECT USING (true);


--
-- Name: crm_flow_logs CRM flow logs insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow logs insertable" ON "prj_D5Snfw9QodSQ".crm_flow_logs FOR INSERT WITH CHECK (true);


--
-- Name: crm_flow_logs CRM flow logs readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow logs readable" ON "prj_D5Snfw9QodSQ".crm_flow_logs FOR SELECT USING (true);


--
-- Name: crm_flow_step_queue CRM flow queue deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow queue deletable" ON "prj_D5Snfw9QodSQ".crm_flow_step_queue FOR DELETE USING (true);


--
-- Name: crm_flow_step_queue CRM flow queue insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow queue insertable" ON "prj_D5Snfw9QodSQ".crm_flow_step_queue FOR INSERT WITH CHECK (true);


--
-- Name: crm_flow_step_queue CRM flow queue readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow queue readable" ON "prj_D5Snfw9QodSQ".crm_flow_step_queue FOR SELECT USING (true);


--
-- Name: crm_flow_step_queue CRM flow queue updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow queue updatable" ON "prj_D5Snfw9QodSQ".crm_flow_step_queue FOR UPDATE USING (true);


--
-- Name: crm_flow_steps CRM flow steps deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow steps deletable" ON "prj_D5Snfw9QodSQ".crm_flow_steps FOR DELETE USING (true);


--
-- Name: crm_flow_steps CRM flow steps insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow steps insertable" ON "prj_D5Snfw9QodSQ".crm_flow_steps FOR INSERT WITH CHECK (true);


--
-- Name: crm_flow_steps CRM flow steps readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow steps readable" ON "prj_D5Snfw9QodSQ".crm_flow_steps FOR SELECT USING (true);


--
-- Name: crm_flow_steps CRM flow steps updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flow steps updatable" ON "prj_D5Snfw9QodSQ".crm_flow_steps FOR UPDATE USING (true);


--
-- Name: crm_flows CRM flows deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flows deletable" ON "prj_D5Snfw9QodSQ".crm_flows FOR DELETE USING (true);


--
-- Name: crm_flows CRM flows insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flows insertable" ON "prj_D5Snfw9QodSQ".crm_flows FOR INSERT WITH CHECK (true);


--
-- Name: crm_flows CRM flows readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flows readable" ON "prj_D5Snfw9QodSQ".crm_flows FOR SELECT USING (true);


--
-- Name: crm_flows CRM flows updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM flows updatable" ON "prj_D5Snfw9QodSQ".crm_flows FOR UPDATE USING (true);


--
-- Name: crm_goal_actions CRM goal actions all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM goal actions all" ON "prj_D5Snfw9QodSQ".crm_goal_actions USING (true) WITH CHECK (true);


--
-- Name: crm_goal_contacts CRM goal contacts all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM goal contacts all" ON "prj_D5Snfw9QodSQ".crm_goal_contacts USING (true) WITH CHECK (true);


--
-- Name: crm_goal_runs CRM goal runs all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM goal runs all" ON "prj_D5Snfw9QodSQ".crm_goal_runs USING (true) WITH CHECK (true);


--
-- Name: crm_goal_work CRM goal work all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM goal work all" ON "prj_D5Snfw9QodSQ".crm_goal_work USING (true) WITH CHECK (true);


--
-- Name: crm_goals CRM goals all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM goals all" ON "prj_D5Snfw9QodSQ".crm_goals USING (true) WITH CHECK (true);


--
-- Name: crm_lists CRM lists deletable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM lists deletable" ON "prj_D5Snfw9QodSQ".crm_lists FOR DELETE USING (true);


--
-- Name: crm_lists CRM lists insertable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM lists insertable" ON "prj_D5Snfw9QodSQ".crm_lists FOR INSERT WITH CHECK (true);


--
-- Name: crm_lists CRM lists readable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM lists readable" ON "prj_D5Snfw9QodSQ".crm_lists FOR SELECT USING (true);


--
-- Name: crm_lists CRM lists updatable; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM lists updatable" ON "prj_D5Snfw9QodSQ".crm_lists FOR UPDATE USING (true);


--
-- Name: crm_opportunities CRM opportunities all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM opportunities all" ON "prj_D5Snfw9QodSQ".crm_opportunities USING (true) WITH CHECK (true);


--
-- Name: crm_opportunity_events CRM opportunity events all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM opportunity events all" ON "prj_D5Snfw9QodSQ".crm_opportunity_events USING (true) WITH CHECK (true);


--
-- Name: crm_pipeline_stages CRM pipeline stages all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM pipeline stages all" ON "prj_D5Snfw9QodSQ".crm_pipeline_stages USING (true) WITH CHECK (true);


--
-- Name: crm_pipelines CRM pipelines all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM pipelines all" ON "prj_D5Snfw9QodSQ".crm_pipelines USING (true) WITH CHECK (true);


--
-- Name: crm_sends CRM sends all; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "CRM sends all" ON "prj_D5Snfw9QodSQ".crm_sends USING (true) WITH CHECK (true);


--
-- Name: crm_calendly_connections Calendly connections service only; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "Calendly connections service only" ON "prj_D5Snfw9QodSQ".crm_calendly_connections USING (false) WITH CHECK (false);


--
-- Name: crm_appointments; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_availability; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_availability ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_calendar_members; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_calendar_members ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_calendars; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_calendars ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_calendly_connections; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_calendly_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_campaigns; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_contact_lists; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_contact_lists ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_contacts; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_events; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_events ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_flow_logs; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_flow_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_flow_step_queue; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_flow_step_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_flow_steps; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_flow_steps ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_flows; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_flows ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_goal_actions; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_goal_actions ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_goal_contacts; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_goal_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_goal_runs; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_goal_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_goal_work; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_goal_work ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_goals; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_lists; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_lists ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_opportunities; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_opportunities ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_opportunity_events; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_opportunity_events ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_pipeline_stages; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_pipeline_stages ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_pipelines; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_pipelines ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_sends; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".crm_sends ENABLE ROW LEVEL SECURITY;

--
-- Name: project_documents docs_insert; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY docs_insert ON "prj_D5Snfw9QodSQ".project_documents FOR INSERT WITH CHECK (true);


--
-- Name: project_documents docs_select; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY docs_select ON "prj_D5Snfw9QodSQ".project_documents FOR SELECT USING (true);


--
-- Name: project_documents docs_update; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY docs_update ON "prj_D5Snfw9QodSQ".project_documents FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: projects own projects delete; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "own projects delete" ON "prj_D5Snfw9QodSQ".projects FOR DELETE USING (((NULLIF(current_setting('request.jwt.claim.sub'::text, true), ''::text))::uuid = user_id));


--
-- Name: projects own projects insert; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "own projects insert" ON "prj_D5Snfw9QodSQ".projects FOR INSERT WITH CHECK (((NULLIF(current_setting('request.jwt.claim.sub'::text, true), ''::text))::uuid = user_id));


--
-- Name: projects own projects select; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "own projects select" ON "prj_D5Snfw9QodSQ".projects FOR SELECT USING (((NULLIF(current_setting('request.jwt.claim.sub'::text, true), ''::text))::uuid = user_id));


--
-- Name: projects own projects update; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY "own projects update" ON "prj_D5Snfw9QodSQ".projects FOR UPDATE USING (((NULLIF(current_setting('request.jwt.claim.sub'::text, true), ''::text))::uuid = user_id));


--
-- Name: profiles; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_insert_own; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY profiles_insert_own ON "prj_D5Snfw9QodSQ".profiles FOR INSERT WITH CHECK (((NULLIF(current_setting('request.jwt.claim.sub'::text, true), ''::text))::uuid = id));


--
-- Name: profiles profiles_select_own; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY profiles_select_own ON "prj_D5Snfw9QodSQ".profiles FOR SELECT USING (((NULLIF(current_setting('request.jwt.claim.sub'::text, true), ''::text))::uuid = id));


--
-- Name: profiles profiles_update_own; Type: POLICY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

CREATE POLICY profiles_update_own ON "prj_D5Snfw9QodSQ".profiles FOR UPDATE USING (((NULLIF(current_setting('request.jwt.claim.sub'::text, true), ''::text))::uuid = id));


--
-- Name: project_documents; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".project_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ".projects ENABLE ROW LEVEL SECURITY;

--
-- Name: users Admin can delete all users; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Admin can delete all users" ON "prj_D5Snfw9QodSQ_auth".users FOR DELETE TO "prj_D5Snfw9QodSQ_role" USING (true);


--
-- Name: identities Admin can delete identities; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Admin can delete identities" ON "prj_D5Snfw9QodSQ_auth".identities FOR DELETE TO "prj_D5Snfw9QodSQ_role" USING (true);


--
-- Name: users Admin can insert users; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Admin can insert users" ON "prj_D5Snfw9QodSQ_auth".users FOR INSERT TO "prj_D5Snfw9QodSQ_role" WITH CHECK (true);


--
-- Name: users Admin can update all users; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Admin can update all users" ON "prj_D5Snfw9QodSQ_auth".users FOR UPDATE TO "prj_D5Snfw9QodSQ_role" USING (true);


--
-- Name: users Admin can view all users; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Admin can view all users" ON "prj_D5Snfw9QodSQ_auth".users FOR SELECT TO "prj_D5Snfw9QodSQ_role" USING (true);


--
-- Name: identities Users can delete own identities; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Users can delete own identities" ON "prj_D5Snfw9QodSQ_auth".identities FOR DELETE USING ((user_id = "prj_D5Snfw9QodSQ_auth".auth_uid()));


--
-- Name: users Users can delete own profile; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Users can delete own profile" ON "prj_D5Snfw9QodSQ_auth".users FOR DELETE USING ((id = "prj_D5Snfw9QodSQ_auth".auth_uid()));


--
-- Name: identities Users can insert own identities; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Users can insert own identities" ON "prj_D5Snfw9QodSQ_auth".identities FOR INSERT WITH CHECK ((user_id = "prj_D5Snfw9QodSQ_auth".auth_uid()));


--
-- Name: users Users can insert own profile; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Users can insert own profile" ON "prj_D5Snfw9QodSQ_auth".users FOR INSERT WITH CHECK ((id = "prj_D5Snfw9QodSQ_auth".auth_uid()));


--
-- Name: identities Users can update own identities; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Users can update own identities" ON "prj_D5Snfw9QodSQ_auth".identities FOR UPDATE USING ((user_id = "prj_D5Snfw9QodSQ_auth".auth_uid()));


--
-- Name: users Users can update own profile; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Users can update own profile" ON "prj_D5Snfw9QodSQ_auth".users FOR UPDATE USING ((id = "prj_D5Snfw9QodSQ_auth".auth_uid()));


--
-- Name: identities Users can view own identities; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Users can view own identities" ON "prj_D5Snfw9QodSQ_auth".identities FOR SELECT USING ((user_id = "prj_D5Snfw9QodSQ_auth".auth_uid()));


--
-- Name: users Users can view own profile; Type: POLICY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

CREATE POLICY "Users can view own profile" ON "prj_D5Snfw9QodSQ_auth".users FOR SELECT USING ((id = "prj_D5Snfw9QodSQ_auth".auth_uid()));


--
-- Name: identities; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ_auth".identities ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ_auth; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ_auth".users ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets Service role can manage buckets; Type: POLICY; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

CREATE POLICY "Service role can manage buckets" ON "prj_D5Snfw9QodSQ_storage".buckets USING (true);


--
-- Name: objects Service role can manage objects; Type: POLICY; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

CREATE POLICY "Service role can manage objects" ON "prj_D5Snfw9QodSQ_storage".objects USING (true);


--
-- Name: buckets; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ_storage".buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

ALTER TABLE "prj_D5Snfw9QodSQ_storage".objects ENABLE ROW LEVEL SECURITY;

--
-- Name: objects project_docs_public_delete; Type: POLICY; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

CREATE POLICY project_docs_public_delete ON "prj_D5Snfw9QodSQ_storage".objects FOR DELETE USING ((bucket_id = 'project-docs'::text));


--
-- Name: objects project_docs_public_insert; Type: POLICY; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

CREATE POLICY project_docs_public_insert ON "prj_D5Snfw9QodSQ_storage".objects FOR INSERT WITH CHECK ((bucket_id = 'project-docs'::text));


--
-- Name: objects project_docs_public_read; Type: POLICY; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

CREATE POLICY project_docs_public_read ON "prj_D5Snfw9QodSQ_storage".objects FOR SELECT USING ((bucket_id = 'project-docs'::text));


--
-- Name: objects project_docs_public_update; Type: POLICY; Schema: prj_D5Snfw9QodSQ_storage; Owner: -
--

CREATE POLICY project_docs_public_update ON "prj_D5Snfw9QodSQ_storage".objects FOR UPDATE USING ((bucket_id = 'project-docs'::text)) WITH CHECK ((bucket_id = 'project-docs'::text));


--
-- PostgreSQL database dump complete
--


