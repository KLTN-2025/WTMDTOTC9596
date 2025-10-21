import { cn } from '@/utils'

export const Banner = ({ image, className }: { image: string; className?: string }) => {
  return (
    <div className={cn('w-full h-full object-cover', className)}>
      <img src={image} alt='banner' />
    </div>
  )
}
