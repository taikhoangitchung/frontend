"use client"

import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import CategoryTable from "../../../components/list/CategoryTable"

export default function Component() {
    const router = useRouter()

    return (
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
            <div className="flex justify-start">
                <Button
                    onClick={() => router.back()}
                    className="bg-gray-700 text-white hover:bg-gray-600 border border-gray-500"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            </div>

            <CategoryTable viewMode={"USER"} />
        </div>
    )
}
