import dynamic from "next/dynamic";

const NavbarWrapper = dynamic(() =>
    import("../components/Navbar"), {ssr: false});

export default function Home() {
    return <NavbarWrapper/>;
}
