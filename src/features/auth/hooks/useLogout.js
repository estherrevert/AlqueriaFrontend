import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "@/features/auth/api/auth.api";
import { qk } from "@/shared/queryKeys";
export function useLogout() {
    const qc = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            qc.setQueryData(qk.me, null);
            qc.removeQueries({ queryKey: qk.me, exact: true });
            navigate("/login", { replace: true });
        },
    });
}
