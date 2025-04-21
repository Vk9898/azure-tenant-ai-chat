export default async function Home() {
  return (
    <div className="container max-w-2xl py-10" data-slot="unauthorized-page">
      <div className="flex flex-col space-y-6">
        <h1 className="ds-section-title">
          Unauthorized Access
        </h1>
        <div className="ds-accent-bar"></div>
        <p className="text-muted-foreground">
          You do not have the necessary permissions to view this page. This section is restricted to administrators only.
        </p>
        <p className="text-muted-foreground">
          If you believe this is an error, please contact your system administrator.
        </p>
      </div>
    </div>
  );
}