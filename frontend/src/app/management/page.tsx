"use client";

import { useCurrentUserState } from "@/api/currentUser";
import Column from "@/components/Column";
import Row from "@/components/Row";
import LoadingButton from "@mui/lab/LoadingButton";
import { useEffect, useState } from "react";

const ManagementPage = () => {
  const currentUser = useCurrentUserState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getBotBalance = async () => {
      const res = await currentUser.authFetch("/management");
      const data = await res.json();
      console.log("DATA: ", data);
    };

    getBotBalance();
  }, []);

  return (
    <Column sx={{ gap: "1rem" }}>
      <h1>Management</h1>
      <p>Manage your application here.</p>
      <Row sx={{ gap: "1rem" }}>
        <LoadingButton
          loading={loading}
          onClick={async () => {
            setLoading(true);
            await currentUser.postMaintenanceStatus(true);
            setLoading(false);
          }}
          color="error"
          variant="contained"
        >
          Maintenance mode
        </LoadingButton>

        <LoadingButton
          loading={loading}
          onClick={async () => {
            setLoading(true);
            await currentUser.postMaintenanceStatus(false);
            setLoading(false);
          }}
          color="success"
          variant="contained"
        >
          Active mode
        </LoadingButton>
      </Row>
    </Column>
  );
};

export default ManagementPage;
