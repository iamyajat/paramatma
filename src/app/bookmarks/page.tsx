import { redirect } from "next/navigation";

// The bookmarks section was renamed to "Saved". Keep this route as a permanent
// redirect so old links and installed PWA shortcuts still work.
export default function BookmarksRedirect() {
  redirect("/saved");
}
