export interface FishData {
  id: string        // filename: public/models/fish/{id}.ply
  name: string
  creator: string
  quote: string
  scale?: number    // optional uniform scale (default 1)
  color?: string    // fallback color if PLY has no vertex colors
}

export const fish: FishData[] = [
  // Add your fish here. Drop the .ply in public/models/fish/ and add an entry.
  // Example:
  // {
  //   id: 'bubbles',
  //   name: 'Bubbles',
  //   creator: 'Evie',
  //   quote: 'just keep swimming',
  //   scale: 0.5,
  //   color: '#ff9966',
  // },
]
