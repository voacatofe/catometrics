import { User } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<User, "image" | "name">
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      {user.image ? (
        <AvatarImage alt="Avatar" src={user.image} />
      ) : (
        <AvatarFallback>
          {user.name ? getInitials(user.name) : "?"}
        </AvatarFallback>
      )}
    </Avatar>
  )
}

function getInitials(name: string) {
  const parts = name.split(" ")
  const initials = parts.map((part) => part[0]).join("")
  return initials.toUpperCase().substring(0, 2)
} 