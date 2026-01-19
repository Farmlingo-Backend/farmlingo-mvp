import { SignUp } from "@clerk/clerk-react";

export default function SignPage() {
  return (
   <div className="flex items-center justify-center px-4">
    <SignUp forceRedirectUrl="/" />
   </div>
  );
}
