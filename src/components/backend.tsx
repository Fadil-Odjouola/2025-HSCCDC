import type { UserLocal } from "@/types/user";

export const getUserLocal = (): UserLocal | null => {
  try {
    const userLocal =
      localStorage.getItem("User_logged") || sessionStorage.getItem("User_logged");
    if (!userLocal) {
      return null;
    }

    const user = JSON.parse(userLocal) as UserLocal;
    console.log(user)

    // Strict validation of required fields

      return user;
  } catch (error) {
    console.error("Error parsing user from storage:", error);
    return null;
  }
};
