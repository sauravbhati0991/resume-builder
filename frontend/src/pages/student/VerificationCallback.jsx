import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerificationCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const status = params.get("status");
        const error = params.get("error");

        if (status === "success") {
            navigate("/stu/verification-success");
        } else {
            navigate("/stu/verification-failed");
        }
    }, []);

    return (
        <div className="flex items-center justify-center h-screen text-lg font-semibold">
            Verifying your APAAR... Please wait ⏳
        </div>
    );
}