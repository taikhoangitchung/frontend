import Image from "next/image";

function AvatarUser({path, width, height}) {
    return (
        <>
            <div
                className="relative overflow-hidden rounded-full border border-gray-300 shadow-md"
                style={{ width: width, height: height }}
            >
            <Image src={path || "/globe.svg"}
                   alt="Avatar"
                   width={width}
                   height={height}
                   className="object-cover"
            />
            </div>
        </>
    )
}

export default AvatarUser