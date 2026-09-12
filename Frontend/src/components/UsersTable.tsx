import { useTranslation } from "react-i18next"
import type { User } from "../types/users"
import ActionMenu from "./ui/ActionMenu"
import GenericButton from "./ui/GenericButton"

interface Props {
    users: User[] | null
}

function UsersTable({ users }: Props) {
    const { t } = useTranslation(['users', 'common'])

    return (
        <div className="relative">
            <div className="
                dark:text-white
                border border-yellow-600
                before:absolute
                before:top-0 before:left-0
                before:w-6 before:h-6
                before:border-t-2 before:border-l-2
                before:border-yellow-600
            ">
                {!users && (
                    <p className="italic text-center py-2">{t('userManager.table.loadingMessage')}</p>
                )}

                {users && (
                    <table className="w-full table-fixed not-md:text-sm">
                        <thead className="text-left font-semibold">
                            <tr className="border-b border-yellow-600">
                                <th className="px-2 py-1">{t('userManager.table.header.name')}</th>
                                <th className="px-2 py-1">{t('userManager.table.header.email')}</th>
                                <th className="px-2 py-1">{t('userManager.table.header.role')}</th>
                                <th className="px-2 py-1 w-16">{t('userManager.table.header.actions')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="even:bg-gray-200 dark:even:bg-zinc-900 cursor-pointer"
                                >
                                    <td className="px-2 not-md:py-1 wrap-break-word">{user.first_name} {user.last_name.toUpperCase()}</td>
                                    <td className="px-2 not-md:py-1 wrap-break-word">{user.email}</td>
                                    <td className="px-2 not-md:py-1">{t(`users.roles.${user.role}`, { ns: 'common' })}</td>
                                    <td className="not-md:py-1 flex justify-end">
                                        <ActionMenu>
                                            <div className="flex flex-col gap-2">
                                                <p className="dark:text-white font-semibold text-xl">{user.first_name} {user.last_name.toUpperCase()}</p>

                                                <GenericButton
                                                    click={() => {}}
                                                >
                                                    {t('userManager.actions.update')}
                                                </GenericButton>

                                                <GenericButton
                                                    type="danger"
                                                    click={() => {}}
                                                >
                                                    {t('userManager.actions.delete')}
                                                </GenericButton>
                                            </div>
                                        </ActionMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default UsersTable