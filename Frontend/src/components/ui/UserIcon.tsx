import { BriefcaseBusiness, Calculator, Crown, User } from "lucide-react"
import type { UserRole } from "../../types/users"

interface Props {
    role: UserRole
    size: 'small' | 'large'
}

const dimensions = {
    small: {
        mainIcon: 64,
        roleIcon: 24
    },
    large: {
        mainIcon: 128,
        roleIcon: 32
    }
}

function UserIcon({ role, size }: Props) {
    const RoleIcon = {
        employee: BriefcaseBusiness,
        accountant: Calculator,
        manager: Crown
    }[role]

    return (
        <div className={`
            relative inline-flex
            ${size === 'small' && "w-16 h-16"}
            ${size === 'large' && "w-32 h-32"}
        `}>
            <User size={dimensions[size].mainIcon} className="text-yellow-600" />

            <div className={`
                absolute
                bottom-0 right-0
                flex items-center justify-center
                ${size === 'small' && "w-8 h-8"}
                ${size === 'large' && "w-12 h-12"}
                rounded-full
                bg-gray-50 dark:bg-zinc-900
            `}>
                <RoleIcon size={dimensions[size].roleIcon} className="text-yellow-600" />
            </div>
        </div>
    )
}

export default UserIcon