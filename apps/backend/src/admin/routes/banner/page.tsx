import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"

const BannerPage = () => {
  return (
    <Container className="p-6">
      <Heading level="h1">Banner</Heading>
      <Text className="text-ui-fg-subtle mt-2">
        Manage banner content from this section.
      </Text>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Banner",
})

export default BannerPage
