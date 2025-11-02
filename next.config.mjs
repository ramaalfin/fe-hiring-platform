/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "https://be-hiring-platform.vercel.app/api/:path*",
            },
        ];
    },
};

export default nextConfig;
