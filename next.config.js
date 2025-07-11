/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // ✅ Tắt Strict Mode
    images: {
        domains: [process.env.NEXT_PUBLIC_SUPABASE_DOMAIN,
            "lh3.googleusercontent.com"],
    },
};

module.exports = nextConfig;