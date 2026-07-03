"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface Category {
  _id: Id<"categories">;
  name: string;
}

interface ProductFormData {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  priceAmountCents: number;
  compareAtPriceCents?: number;
  categoryId?: Id<"categories">;
  coverImageUrl: string;
  formatInfo: string;
  fileSize: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  status: "draft" | "active" | "archived";
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  onSubmit: (data: ProductFormData) => void;
  isLoading: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription ?? ""
  );
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [priceDisplay, setPriceDisplay] = useState(
    initialData?.priceAmountCents
      ? (initialData.priceAmountCents / 100).toFixed(2)
      : ""
  );
  const [compareAtPriceDisplay, setCompareAtPriceDisplay] = useState(
    initialData?.compareAtPriceCents
      ? (initialData.compareAtPriceCents / 100).toFixed(2)
      : ""
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.categoryId ?? ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialData?.coverImageUrl ?? ""
  );
  const [formatInfo, setFormatInfo] = useState(initialData?.formatInfo ?? "");
  const [fileSize, setFileSize] = useState(initialData?.fileSize ?? "");
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") ?? ""
  );
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initialData?.metaDescription ?? ""
  );
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    initialData?.status ?? "draft"
  );

  // Auto-generate slug from title when not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && !initialData?.slug) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited, initialData?.slug]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const priceInCents = Math.round(parseFloat(priceDisplay || "0") * 100);
    const compareAtCents = compareAtPriceDisplay
      ? Math.round(parseFloat(compareAtPriceDisplay) * 100)
      : undefined;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title,
      slug,
      shortDescription,
      description,
      priceAmountCents: priceInCents,
      compareAtPriceCents: compareAtCents,
      categoryId: categoryId
        ? (categoryId as Id<"categories">)
        : undefined,
      coverImageUrl,
      formatInfo,
      fileSize,
      tags,
      metaTitle,
      metaDescription,
      featured,
      status,
    });
  }

  const isEditMode = !!initialData?.title;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="My Digital Product"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="my-digital-product"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              required
            />
            <p className="text-xs text-muted-foreground">
              URL-safe identifier. Auto-generated from title.
            </p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="A brief summary of the product"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Full product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Supports Markdown formatting.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pricing</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="9.99"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Compare-at Price ($)</Label>
            <Input
              id="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="19.99"
              value={compareAtPriceDisplay}
              onChange={(e) => setCompareAtPriceDisplay(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Original price for showing discounts. Leave empty if none.
            </p>
          </div>
        </div>
      </div>

      {/* Organization */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Organization</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(val) =>
                setStatus(val as "draft" | "active" | "archived")
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="design, template, ui-kit"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of tags.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Featured product
            </Label>
          </div>
        </div>
      </div>

      {/* Media & Files */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Media & File Details</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="coverImageUrl">Cover Image URL</Label>
            <Input
              id="coverImageUrl"
              type="url"
              placeholder="https://example.com/cover.jpg"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formatInfo">Format Info</Label>
            <Input
              id="formatInfo"
              placeholder="PDF, 45 pages"
              value={formatInfo}
              onChange={(e) => setFormatInfo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileSize">File Size</Label>
            <Input
              id="fileSize"
              placeholder="12 MB"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">SEO</h3>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              placeholder="Product title for search engines"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              placeholder="Brief description for search engine results"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditMode ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
