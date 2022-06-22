import dotenv from 'dotenv'
import router from './router'

export default function main() {
  dotenv.config()
  const baseUrl = process.env.BASE_URL || 'http://localhost'
  const port = process.env.PORT || 8000

  router.listen(port, () => {
    try {
      const happyFace: string = String.raw`\(ᵔᵕᵔ)/`
      console.log(
        `${happyFace} Messaging server is up and running! ${baseUrl}:${port}`
      )
    } catch (error) {
      const sadFace: string = '(._. )'
      console.log(
        `${sadFace} The messaging server crashed due to error:\n${error}`
      )
    }
  })
}

main()
