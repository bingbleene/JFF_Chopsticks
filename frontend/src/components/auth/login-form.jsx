import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "@/stores/useAuthStore"
import { useNavigate } from "react-router-dom"
import { useState } from "react"


const logInSchema = z.object({
  username: z.string().min(8, "username phải có ít nhất 8 ký tự"),
  password: z.string().min(8, "password phải có ít nhất 8 ký tự")
})

export const LoginForm = ({ className, ...props }) => {
  const { signIn } = useAuthStore()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(logInSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  const onSubmit = async (data) => {
    try {
      setErrorMsg("")
      const { username, password } = data

      await signIn(username, password)
      navigate("/")
    } catch (error) {
      console.error(error)
      setErrorMsg("Sai username hoặc password")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-12" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6 text-balance">
              
              {/* Header */}
              <div className="flex flex-col items-center text-center gap-2 mb-6">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img
                    src="/chopsticks_ava.svg"
                    alt="logo"
                    className="w-16 h-16 object-contain"
                  />
                </a>
                <h1 className="text-2xl font-bold">Đăng nhập</h1>
                <p className="text-muted-foreground text-balance">
                  Chào mừng bạn quay lại!
                </p>
              </div>

              {/* ERROR BACKEND */}
              {errorMsg && (
                <p className="text-destructive text-sm text-center">
                  {errorMsg}
                </p>
              )}

              {/* username */}
              <div className="flex flex-col gap-3 mb-3">
                <label htmlFor="username" className="block text-sm">
                  Username
                </label>
                <Input
                  type="text"
                  id="username"
                  placeholder="Nhập username của bạn"
                  {...register("username")}
                  disabled={isSubmitting}
                />
                {errors.username && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* password */}
              <div className="flex flex-col gap-3 mb-3">
                <label htmlFor="password" className="block text-sm">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Nhập password của bạn"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* button */}
              <Button
                type="submit"
                className="w-full mt-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <p className="text-sm text-center text-muted-foreground mt-4">
                Nếu không biết tài khoản, hãy liên hệ người giữ code.
              </p>
            </div>
          </form>

          {/* image */}
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholderSignIn.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
        {/* Không export default nữa vì đã export named ở trên */}
      </Card>
    </div>
  )
}

