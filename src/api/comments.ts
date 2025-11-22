import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import type { ProductComment, CreateCommentData, UpdateCommentData } from '@/types/comments'
import camelcaseKeys from 'camelcase-keys'
import type { User } from '@supabase/supabase-js'
export const getProductComments = async (productId: string) => {
  const { data, error } = await supabase
    .from(TABLES.PRODUCT_COMMENTS)
    .select('*')
    .eq('product_id', productId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error }
  }

  const userIds = new Set<string>()
  const comments = (data ?? []).map(comment => {
    const camelized = camelcaseKeys(comment, { deep: true }) as any
    if (camelized.userId) {
      userIds.add(camelized.userId)
    }
    return {
      ...camelized,
      user: undefined,
      replies: []
    }
  })

  let profilesMap = new Map<string, any>()
  if (userIds.size > 0) {
    const { data: profilesData } = await supabase
      .from(TABLES.PROFILES)
      .select('id, full_name, avatar_url')
      .in('id', Array.from(userIds))

    if (profilesData) {
      profilesData.forEach(profile => {
        const camelized = camelcaseKeys(profile, { deep: true })
        profilesMap.set(camelized.id, camelized)
      })
    }
  }

  comments.forEach(comment => {
    const profile = profilesMap.get(comment.userId)
    if (profile) {
      comment.user = {
        id: profile.id,
        fullName: profile.fullName || null,
        avatarUrl: profile.avatarUrl || null
      }
    }
  })

  if (comments.length > 0) {
    const commentIds = comments.map(c => c.id)
    const { data: repliesData } = await supabase
      .from(TABLES.PRODUCT_COMMENTS)
      .select('*')
      .in('parent_id', commentIds)
      .order('created_at', { ascending: true })

    if (repliesData) {
      const replyUserIds = new Set<string>()
      repliesData.forEach(reply => {
        const camelized = camelcaseKeys(reply, { deep: true })
        if (camelized.userId) {
          replyUserIds.add(camelized.userId)
        }
      })

      if (replyUserIds.size > 0) {
        const { data: replyProfilesData } = await supabase
          .from(TABLES.PROFILES)
          .select('id, full_name, avatar_url')
          .in('id', Array.from(replyUserIds))

        if (replyProfilesData) {
          replyProfilesData.forEach(profile => {
            const camelized = camelcaseKeys(profile, { deep: true })
            profilesMap.set(camelized.id, camelized)
          })
        }
      }

      const repliesMap = new Map<string, ProductComment[]>()
      repliesData.forEach(reply => {
        const camelized = camelcaseKeys(reply, { deep: true }) as any
        const profile = profilesMap.get(camelized.userId)
        const replyComment: ProductComment = {
          ...camelized,
          user: profile
            ? {
                id: profile.id,
                fullName: profile.fullName || null,
                avatarUrl: profile.avatarUrl || null
              }
            : undefined,
          replies: []
        }
        const parentId = camelized.parentId
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, [])
        }
        repliesMap.get(parentId)!.push(replyComment)
      })

      comments.forEach(comment => {
        comment.replies = repliesMap.get(comment.id) || []
      })
    }
  }

  return { data: comments, error: null }
}

export const createComment = async (commentData: CreateCommentData, user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.PRODUCT_COMMENTS)
    .insert({
      product_id: commentData.productId,
      user_id: user.id,
      content: commentData.content,
      parent_id: commentData.parentId || null
    })
    .select('*')
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: data, error: null }
}

export const updateComment = async (
  commentId: string,
  updateData: UpdateCommentData,
  user: User | null
) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.PRODUCT_COMMENTS)
    .update({
      content: updateData.content,
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    return { data: null, error }
  }

  const camelized = camelcaseKeys(data, { deep: true }) as any
  const { data: profileData } = await supabase
    .from(TABLES.PROFILES)
    .select('id, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const profile = profileData ? camelcaseKeys(profileData, { deep: true }) : null
  const comment: ProductComment = {
    ...camelized,
    user: profile
      ? {
          id: profile.id,
          fullName: profile.fullName || null,
          avatarUrl: profile.avatarUrl || null
        }
      : undefined,
    replies: []
  }

  return { data: comment, error: null }
}

export const deleteComment = async (commentId: string, user: User | null) => {
  if (!user) {
    return { error: { message: 'User not authenticated' } }
  }

  const { error } = await supabase
    .from(TABLES.PRODUCT_COMMENTS)
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  return { error }
}
