export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type DepartmentSummary = {
  uuid: string
  name: string
  slug: string
  shortName: string
  briefDescription: string
  thumbnail: string
}

export type DepartmentDetail = {
  uuid: string
  name: string
  slug: string
  shortName: string
  briefDescription: string
  detailedDescription: string
  phoneNo: string | null
  email: string | null
  thumbnail: string
  socialLinks: { uuid: string; platform: string; url: string }[]
}

export type DepartmentDownload = {
  uuid: string
  title: string
  description: string
  file: string
}

export type DepartmentPlan = {
  uuid: string
  title: string
  description: string
  file: string
}

export type DepartmentProgram = {
  uuid: string
  name: string
  shortName: string
  slug: string
  description: string
  programType: string
  thumbnail: string
}

export type DepartmentEvent = {
  uuid: string
  title: string
  description?: string | null
  eventType?: string | null
  eventStartDate?: string | null
  eventEndDate?: string | null
  thumbnail?: string | null
  registrationLink?: string | null
  location?: string | null
}

export type DepartmentStaff = {
  uuid: string
  title: string
  name: string
  designation: string
  photo: string
  phoneNumber: string | null
  email: string | null
  message: string | null
  displayOrder: number
}

export type EventGalleryItem = {
  uuid: string
  image: string
  caption: string
}
