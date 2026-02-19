import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'KitchenOS Logo'
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse RGB container
            <div
                style={{
                    fontSize: 20,
                    background: '#10b981', // emerald-500
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '50%',
                }}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M17 21H7a2 2 0 0 1-2-2v-3a2 2 0 1 1 0-4 2 2 0 0 1 0-4 2 2 0 0 1 2-2h1.5a2.5 2.5 0 0 0 5 0H15a2 2 0 0 1 2 2 2 2 0 0 1 0 4 2 2 0 0 1 0 4v3a2 2 0 0 1-2 2Z" />
                    <path d="M9 13a3 3 0 0 1 6 0" />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    )
}
