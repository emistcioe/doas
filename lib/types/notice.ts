export type NoticeMedia = {
  uuid: string
  file: string
  caption: string | null
  mediaType: string
}

export type NoticeAuthor = {
  uuid: string
  fullName: string
  photo: string | null
}

export type Notice = {
  uuid: string
  title: string
  slug: string
  description: string
  thumbnail: string | null
  isFeatured: boolean
  department: { uuid: string; name: string }
  category: { uuid: string; name: string } | null
  publishedAt: string
  medias: NoticeMedia[]
  author: NoticeAuthor | null
}

export type PaginatedNotices = {
  count: number
  next: string | null
  previous: string | null
  results: Notice[]
}

