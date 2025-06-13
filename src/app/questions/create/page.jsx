'use client'

import dynamic from "next/dynamic"

const DynamicWrapper = dynamic(() => import("../../../components/question/CreateForm"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500">
                Loading...
            </div>
        </div>
    ),
})

export default function Component() {
    return <DynamicWrapper/>
}
