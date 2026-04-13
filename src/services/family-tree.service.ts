import { useAuthConfig } from '@/config/auth.config'
import type { SignupFormValues, SignupResponseData } from '@/types/authentication.types'
import type { ApiResponse, ValidationErrorResponse } from '@/types/general.types'
import type { AxiosError } from 'axios'
import { useMutation, useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/config/axios.config'
import { computed, toValue } from 'vue'
import type { MaybeRef } from 'vue'
import type {
  FamilyInsightInterface,
  FamilyMemberFormValues,
  FamilyMemberInterface,
  FamilyRequestFormValues,
  FamilyTreeByUniqueIdentifierResponse,
  FamilyTreeInterface,
  TimelineEntryInterface,
  TimelineFormValues,
  TimelineInterface,
  TreePrivacySettingsFormValues,
  TreePrivacySettingsInterface,
  TreeSettingsFormValues,
  TreeSettingsInterface,
} from '@/types/family-tree.types'
const authConfig = useAuthConfig()

// Add Family Member endpoint
export const useAddFamilyMemberMutation = () => {
  return useMutation<
    ApiResponse<FamilyMemberFormValues>,
    AxiosError<ValidationErrorResponse>,
    FamilyMemberFormValues
  >({
    mutationFn: async (data: FamilyMemberFormValues) => {
      const response = await axiosInstance.post<ApiResponse<FamilyMemberFormValues>>(
        '/api/user/family-members',
        data,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

// Update Family Member endpoint
export const useUpdateFamilyMemberMutation = () => {
  return useMutation<
    ApiResponse<FamilyMemberFormValues>,
    AxiosError<ValidationErrorResponse>,
    { id: number; data: Partial<FamilyMemberFormValues> }
  >({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FamilyMemberFormValues> }) => {
      const response = await axiosInstance.post<ApiResponse<FamilyMemberFormValues>>(
        `/api/user/family-members/${id}`,
        { ...data, _method: 'PUT' },
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

// Request to Join Family endpoint
export const useRequestToJoinFamilyMutation = () => {
  return useMutation<
    ApiResponse<FamilyRequestFormValues>,
    AxiosError<ValidationErrorResponse>,
    FamilyRequestFormValues
  >({
    mutationFn: async (data: FamilyRequestFormValues) => {
      const response = await axiosInstance.post<ApiResponse<FamilyRequestFormValues>>(
        '/api/user/join-requests',
        data,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useGetFamilyMembersQuery = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<FamilyMemberInterface[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['family-members'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<FamilyMemberInterface[]>>(
        '/api/user/family-members',
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: options?.enabled ?? true,
  })
}

export const useGetFamilyMembersByIdentifierQuery = (
  identifier: MaybeRef<string>,
  options?: {
    enabled?: MaybeRef<boolean>
  },
) => {
  return useQuery<FamilyTreeByUniqueIdentifierResponse, AxiosError<ValidationErrorResponse>>({
    queryKey: ['family-members-by-identifier', identifier],
    queryFn: async () => {
      const id = toValue(identifier)
      const response = await axiosInstance.get<FamilyTreeByUniqueIdentifierResponse>(
        `/api/user/family-members/by-tree/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: options?.enabled,
  })
}

export const useGetFamilyMemberQuery = (
  identifier: MaybeRef<string>,
  options?: {
    enabled?: MaybeRef<boolean>
  },
) => {
  return useQuery<ApiResponse<FamilyMemberInterface>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['family-member', identifier],
    queryFn: async () => {
      const id = toValue(identifier)
      const response = await axiosInstance.get<ApiResponse<FamilyMemberInterface>>(
        `/api/user/family-members/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: options?.enabled,
  })
}

export const useGetFamilyTreesQuery = (options?: {
  enabled?: boolean
  relativeMemberId?: MaybeRef<string | number | null>
}) => {
  const memberId = computed(() => toValue(options?.relativeMemberId))
  return useQuery<ApiResponse<FamilyTreeInterface>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['family-trees', memberId],
    queryFn: async () => {
      const currentMemberId = toValue(options?.relativeMemberId)
      const params: Record<string, string | number> = {}
      if (currentMemberId) {
        params.relative_member_id = currentMemberId
      }
      const response = await axiosInstance.get<ApiResponse<FamilyTreeInterface>>(
        '/api/user/family-trees',
        {
          params,
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: options?.enabled ?? true,
  })
}

export const useGetTimelinesQuery = (familyMemberId: MaybeRef<string | number>) => {
  const familyMemberIdValue = computed(() => toValue(familyMemberId))
  return useQuery<ApiResponse<TimelineInterface[]>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['timelines', familyMemberIdValue],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<TimelineInterface[]>>(
        `/api/user/family-members/${familyMemberIdValue.value}/timelines`,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useCreateTimelineMutation = (familyMemberId: MaybeRef<string | number>) => {
  const familyMemberIdValue = computed(() => toValue(familyMemberId))
  return useMutation<
    ApiResponse<TimelineEntryInterface>,
    AxiosError<ValidationErrorResponse>,
    TimelineFormValues
  >({
    mutationFn: async (data: TimelineFormValues) => {
      const response = await axiosInstance.post<ApiResponse<TimelineEntryInterface>>(
        `/api/user/family-members/${familyMemberIdValue.value}/timelines`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useUpdateTimelineMutation = (
  familyMemberId: MaybeRef<string | number>,
  timelineId: MaybeRef<string | number>,
) => {
  const familyMemberIdValue = computed(() => toValue(familyMemberId))
  const timelineIdValue = computed(() => toValue(timelineId))
  return useMutation<
    ApiResponse<TimelineEntryInterface>,
    AxiosError<ValidationErrorResponse>,
    TimelineFormValues
  >({
    mutationFn: async (data: TimelineFormValues) => {
      const response = await axiosInstance.patch<ApiResponse<TimelineEntryInterface>>(
        `/api/user/family-members/${familyMemberIdValue.value}/timelines/${timelineIdValue.value}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useDeleteTimelineMutation = (familyMemberId: MaybeRef<string | number>) => {
  const familyMemberIdValue = computed(() => toValue(familyMemberId))
  return useMutation<ApiResponse<void>, AxiosError<ValidationErrorResponse>, number>({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete<ApiResponse<void>>(
        `/api/user/family-members/${familyMemberIdValue.value}/timelines/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )

      return response.data
    },
  })
}

export const useGetFamilyInsightsQuery = () => {
  return useQuery<ApiResponse<FamilyInsightInterface>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['family-insights'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<FamilyInsightInterface>>(
        '/api/user/family-trees/insights',
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useGetTreeSettingsQuery = (
  familyMemberId: MaybeRef<string | number | null | undefined>,
  options?: { enabled?: MaybeRef<boolean | undefined> },
) => {
  const familyMemberIdValue = computed(() => toValue(familyMemberId))
  const userEnabled = computed(() =>
    options?.enabled !== undefined ? toValue(options.enabled) : true,
  )
  return useQuery<ApiResponse<TreeSettingsInterface>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['tree-settings', familyMemberIdValue],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<TreeSettingsInterface>>(
        `/api/user/family-trees/${familyMemberIdValue.value}/tree-settings`,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: computed(
      () =>
        userEnabled.value && familyMemberIdValue.value != null && familyMemberIdValue.value !== '',
    ),
  })
}

export const useUpdateTreeSettingsMutation = (
  familyMemberId: MaybeRef<string | number | null | undefined>,
) => {
  const familyMemberIdValue = computed(() => toValue(familyMemberId))
  return useMutation<
    ApiResponse<TreeSettingsInterface>,
    AxiosError<ValidationErrorResponse>,
    TreeSettingsFormValues
  >({
    mutationFn: async (data: TreeSettingsFormValues) => {
      const id = familyMemberIdValue.value
      if (id == null || id === '') {
        throw new Error('Family member id is required to update tree settings')
      }
      const response = await axiosInstance.patch<ApiResponse<TreeSettingsInterface>>(
        `/api/user/family-trees/${id}/tree-settings`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}

export const useGetTreePrivacySettingsQuery = (
  familyMemberId: MaybeRef<string | number | null | undefined>,
  options?: { enabled?: MaybeRef<boolean | undefined> },
) => {
  const familyMemberIdValue = computed(() => toValue(familyMemberId))
  const userEnabled = computed(() =>
    options?.enabled !== undefined ? toValue(options.enabled) : true,
  )
  return useQuery<ApiResponse<TreePrivacySettingsInterface>, AxiosError<ValidationErrorResponse>>({
    queryKey: ['tree-privacy-settings', familyMemberIdValue],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<TreePrivacySettingsInterface>>(
        `/api/user/family-trees/${familyMemberIdValue.value}/privacy-settings`,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
    enabled: computed(
      () =>
        userEnabled.value && familyMemberIdValue.value != null && familyMemberIdValue.value !== '',
    ),
  })
}

export const useUpdateTreePrivacySettingsMutation = (
  familyMemberId: MaybeRef<string | number | null | undefined>,
) => {
  const familyMemberIdValue = computed(() => toValue(familyMemberId))
  return useMutation<
    ApiResponse<TreePrivacySettingsInterface>,
    AxiosError<ValidationErrorResponse>,
    TreePrivacySettingsFormValues
  >({
    mutationFn: async (data: TreePrivacySettingsFormValues) => {
      const id = familyMemberIdValue.value
      if (id == null || id === '') {
        throw new Error('Family member id is required to update privacy settings')
      }
      const response = await axiosInstance.patch<ApiResponse<TreePrivacySettingsInterface>>(
        `/api/user/family-trees/${id}/privacy-settings`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authConfig.getToken()}`,
          },
        },
      )
      return response.data
    },
  })
}
