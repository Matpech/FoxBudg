import { Chart, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"
import type { UserStats } from "../types/users"
import { useTranslation } from "react-i18next"

Chart.register(
    ArcElement,
    Tooltip,
    Legend
)

interface Props {
    stats: UserStats
}

function StatsDonut({ stats }: Props) {
    const { t } = useTranslation()

    const data = {
        labels: [
            t('reports.status.pending'),
            t('reports.status.approved'),
            t('reports.status.denied'),
            t('reports.status.processed')
        ],
        datasets: [
            {
                data: [
                    stats.pending,
                    stats.approved,
                    stats.denied,
                    stats.processed
                ],
                backgroundColor: [
                    '#686868',
                    '#00e124',
                    '#e1000f',
                    '#007f14'
                ],
                borderWidth: 1
            }
        ]
    }

    return (
        <Doughnut data={data} options={{ cutout: "75%" }} />
    )
}

export default StatsDonut