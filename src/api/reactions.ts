import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import type { ReactionType, ReactionStats } from '@/types/comments'
import type { User } from '@supabase/supabase-js'
export const getProductReactions = async (productId: string, user: User | null) => {
  const { data: reactionsData, error } = await supabase
    .from(TABLES.PRODUCT_REACTIONS)
    .select('reaction_type, user_id')
    .eq('product_id', productId)

  if (error) {
    return { data: null, error }
  }

  const stats: ReactionStats = {
    happy: 0,
    love: 0,
    surprised: 0,
    sad: 0,
    angry: 0,
    userReaction: null
  }

  reactionsData?.forEach(reaction => {
    const reactionType = reaction.reaction_type as ReactionType
    if (stats.hasOwnProperty(reactionType)) {
      stats[reactionType]++
    }
    if (user && reaction.user_id === user.id) {
      stats.userReaction = reactionType
    }
  })

  return { data: stats, error: null }
}

export const setProductReaction = async (
  productId: string,
  reactionType: ReactionType | null,
  user: User | null
) => {
  if (!user) {
    return { error: { message: 'User not authenticated' } }
  }

  if (reactionType === null) {
    const { error } = await supabase
      .from(TABLES.PRODUCT_REACTIONS)
      .delete()
      .eq('product_id', productId)
      .eq('user_id', user.id)

    return { error }
  }

  const { error } = await supabase.from(TABLES.PRODUCT_REACTIONS).upsert(
    {
      product_id: productId,
      user_id: user.id,
      reaction_type: reactionType,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: 'product_id,user_id'
    }
  )

  return { error }
}
