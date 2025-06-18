"use client"

import {useEffect, useState} from "react"

export default function UserStatusSwitch({user, onToggle}) {
    const [checked, setChecked] = useState(user.active)

    useEffect(() => {
        setChecked(user.active)
    }, [user.active])

    const handleChange = async () => {
        const newChecked = !checked
        setChecked(newChecked)
        await onToggle(user, newChecked)
    }

    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={handleChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring
                ${checked ? "bg-green-500" : "bg-red-500"}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${checked ? "translate-x-6" : "translate-x-1"}`}
            />
        </button>
    )
}
