import VerifyOtp from "@/components/auth/verify-otp"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full   justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <VerifyOtp />
      </div>
    </div>
  )
}


