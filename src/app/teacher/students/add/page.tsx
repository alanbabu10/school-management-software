import { redirect } from "next/navigation";

export default function TeacherAddStudentPage() {
  redirect("/teacher/students?add=true");
}
