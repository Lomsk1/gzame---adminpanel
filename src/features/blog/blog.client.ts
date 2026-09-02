import axiosAuth, { axiosMultipartAuth } from "../../helper/axios";
import type { BlogFormData } from "../../components/drawers/blog-editor-drawer";
import type { BlogStatus } from "../../types/blog/blog";

type SaveBlogInput = {
  intent: "create" | "update";
  id?: string;
  data: BlogFormData;
};

function buildPayload(data: BlogFormData, includeCoverUrl: boolean) {
  const { coverFile: _coverFile, removeCover: _removeCover, ...rest } = data;
  return {
    title: rest.title,
    body: rest.body,
    excerpt: rest.excerpt,
    slug: rest.slug,
    tags: rest.tags ?? [],
    status: rest.status ?? ("draft" as BlogStatus),
    author_name: rest.author_name?.trim() || "GzaMe Team",
    ...(includeCoverUrl ? { cover_image: rest.cover_image } : {}),
  };
}

export async function saveBlogPost({ intent, id, data }: SaveBlogInput): Promise<void> {
  const hasCoverFile = Boolean(data.coverFile && data.coverFile.size > 0);

  const form = new FormData();
  form.append("payload", JSON.stringify(buildPayload(data, !hasCoverFile)));

  if (hasCoverFile && data.coverFile) {
    form.append("cover", data.coverFile, data.coverFile.name || "cover.jpg");
  }
  if (data.removeCover && !hasCoverFile) {
    form.append("remove_cover", "true");
  }

  if (intent === "create") {
    await axiosMultipartAuth.post("/api/v1/blog", form);
    return;
  }

  if (!id) throw new Error("Missing post id");
  await axiosMultipartAuth.patch(`/api/v1/blog/id/${id}`, form);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await axiosAuth.delete(`/api/v1/blog/id/${id}`);
}

export async function patchBlogPost(
  id: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await axiosAuth.patch(`/api/v1/blog/id/${id}`, payload);
}

export function blogSaveErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as { response?: { data?: { message?: string } } }).response
      ?.data?.message;
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Request failed.";
}
