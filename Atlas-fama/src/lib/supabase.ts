import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://dgjqtdkfixmhyzthpbgp.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImExYzNlYWE3LTZiOTktNDM3Zi05YWUyLWNkZGI0ZmFmNjkzNyJ9.eyJwcm9qZWN0SWQiOiJkZ2pxdGRrZml4bWh5enRocGJncCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg0MjUyOTQxLCJleHAiOjIwOTk2MTI5NDEsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.0HUXH6BQCVroMKL9ZkvPAVezKq2wrEMg6W9aqyhjchQ';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };