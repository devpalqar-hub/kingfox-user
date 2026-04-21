import RegisterClient from "./RegisterClient";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <RegisterClient token={searchParams.token} />;
}