<template>
  <div>
    <n-form
      ref="formRef"
      :label-width="80"
      :model="form"
      :rules="rules"
      class="h-full flex md:block flex-col justify-between items-center"
    >
      <div class="w-full flex flex-col gap-2">
        <n-form-item label="Old PIN" path="old_pin">
          <MlbInput
            v-model="form.old_pin"
            id="old_pin"
            name="old_pin"
            type="password"
            show-password-on="mousedown"
            placeholder="Old PIN"
            custom-class="border-gray-300 focus:border-primary-500"
            maxlength="6"
          />
        </n-form-item>
        <n-form-item label="New PIN" path="pin">
          <MlbInput
            v-model="form.pin"
            id="pin"
            name="pin"
            type="password"
            show-password-on="mousedown"
            placeholder="New PIN"
            custom-class="border-gray-300 focus:border-primary-500"
            maxlength="6"
          />
        </n-form-item>
        <n-form-item label="Confirm PIN" path="pin_confirmation">
          <MlbInput
            v-model="form.pin_confirmation"
            id="pin_confirmation"
            name="pin_confirmation"
            type="password"
            show-password-on="mousedown"
            placeholder="Confirm PIN"
            custom-class="border-gray-300 focus:border-primary-500"
            maxlength="6"
          />
        </n-form-item>
      </div>
      <MlbButton
        type="submit"
        label="Save Changes"
        block
        :loading="loading"
        :disabled="loading"
        class="rounded-2xl! bg-primary-700! h-13! text-white!"
        @click="onFormSubmit"
      />
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { changePinValidation } from '@/validations/settings.validations'
import { useMessage, NForm, NFormItem } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import MlbInput from '@/components/ui/MlbInput.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import { useChangeVaultPinMutation } from '@/services/settings.services'
import { handleApiError } from '@/helpers/error.helpers'

interface Props {
  onSuccess?: () => void
}

const props = defineProps<Props>()

const message = useMessage()
const { form, rules } = changePinValidation()
const changePinMutation = useChangeVaultPinMutation()

const formRef = ref<FormInst | null>(null)
const loading = ref<boolean>(false)

const onFormSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form')
      return
    }
    try {
      loading.value = true

      await changePinMutation.mutateAsync({
        old_pin: form.value.old_pin,
        pin: form.value.pin,
        pin_confirmation: form.value.pin_confirmation,
      })
      message.success('Vault PIN changed successfully')
      // Reset form
      form.value.old_pin = ''
      form.value.pin = ''
      form.value.pin_confirmation = ''
      // Call success callback if provided
      if (props.onSuccess) {
        props.onSuccess()
      }
    } catch (error) {
      handleApiError(error, message)
    } finally {
      loading.value = false
    }
  })
}
</script>
