import { BriefcaseBusiness, Calculator, Crown, User } from "lucide-react"
import type { UserRole } from "../../types/users"

interface Props {
    role: UserRole
}

function UserIcon({ role }: Props) {
    const RoleIcon = {
        employee: BriefcaseBusiness,
        accountant: Calculator,
        manager: Crown
    }[role]

    return (
        <div className="relative inline-flex w-32 h-32">
            <User size={128} className="text-yellow-600" />

            <div className="
                absolute
                bottom-0 right-0
                flex items-center justify-center
                w-12 h-12
                rounded-full
                bg-gray-50 dark:bg-zinc-900
            ">
                <RoleIcon size={32} className="text-yellow-600" />
            </div>
        </div>
    )
}

export default UserIcon