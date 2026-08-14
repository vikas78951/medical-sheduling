import RequestEmail from "@/components/auth/email-request"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full   justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RequestEmail />
      </div>
    </div>
  )
}


