import { redirect } from "next/navigation"

// There is no editor after payment any more: gift messages are made in the
// checkout. Old links (a confirmation tab left open) land on the gift page.
export default function CreateForYouMessage({ params }: { params: { code: string } }) {
  redirect(`/foryou/${encodeURIComponent(params.code)}`)
}
