"use client"

import { useId, useState } from "react"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { useT } from "@/lib/i18n/provider"
import { subscribeToNewsletter } from "@/lib/services/newsletter"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// The same shape check the database applies (see subscribe_to_newsletter). A
// single email field doesn't need a form library and a schema library — those
// would add ~100KB of JavaScript to the home page for it.
const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// The newsletter sign-up, on a dark surface (its heading and blurb are the
// caller's): a dark pill field with a round burgundy arrow button inside its
// right end. The field's error id is unique per form, so the footer's and the
// home page's can share a page.
function Newsletter() {
  const t = useT()
  const errorId = useId()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = email.trim()
    if (!EMAIL_SHAPE.test(value)) {
      setError(t("validation.email"))
      return
    }
    setError(undefined)
    setSubmitting(true)
    const result = await subscribeToNewsletter(value)
    setSubmitting(false)
    if (result.success) {
      toast.success(t("home.newsletter.success"))
      setEmail("")
    } else {
      toast.error(result.error)
    }
  }

  return (
    // method="post": if someone submits before this component has hydrated, the
    // browser's own submit must not put the address in the URL (a GET would).
    <form method="post" onSubmit={handleSubmit} noValidate className="space-y-2">
      <div className="relative">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("home.newsletter.emailPlaceholder")}
          aria-label={t("home.newsletter.emailLabel")}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="rounded-full border-white/15 bg-white/10 pr-14 pl-4 text-white placeholder:text-white/70 focus-visible:border-gold focus-visible:ring-gold/40"
        />
        <Button
          type="submit"
          size="icon"
          loading={submitting}
          aria-label={t("home.newsletter.subscribe")}
          className="absolute top-1 right-1 size-9 rounded-full focus-visible:ring-offset-0 max-lg:size-9"
        >
          <ArrowRight aria-hidden />
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-gold">
          {error}
        </p>
      )}
    </form>
  )
}

export { Newsletter }
