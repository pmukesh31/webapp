import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import moment from 'moment';
import React, { useContext } from 'react';
import { Delete } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { errorToast, successToast } from '../ToastMessage/ToastHelper';
import { GlobalContext } from '@/contexts/ContextProvider';
import { httpDelete, httpPost } from '@/helpers/http';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface FlowInterface {
  name: string;
  cron: string;
  deploymentName: string;
  deploymentId: string;
  lastRun: any;
}

interface FlowsInterface {
  flows: Array<FlowInterface>;
  updateCrudVal: (...args: any) => any;
  mutate: (...args: any) => any;
}

const Flows = ({ flows, updateCrudVal, mutate }: FlowsInterface) => {
  const handleClickCreateFlow = () => {
    updateCrudVal('create');
  };

  const { data: session }: any = useSession();
  const toastContext = useContext(GlobalContext);

  const lastRunTime = (startTime: string) => {
    return moment(new Date(startTime)).fromNow();
  };

  const handleQuickRunDeployment = (deploymentId: string) => {
    (async () => {
      try {
        await httpPost(session, `prefect/flows/${deploymentId}/flow_run`, {});
        successToast('Flow run inititated successfully', [], toastContext);
      } catch (err: any) {
        console.error(err);
        errorToast(err.message, [], toastContext);
      }
    })();
  };

  const handleDeleteFlow = (deploymentId: string) => {
    (async () => {
      try {
        const data = await httpDelete(session, `prefect/flows/${deploymentId}`);
        mutate();
        if (data?.success) {
          successToast('Flow deleted successfully', [], toastContext);
        } else {
          errorToast('Something went wrong', [], toastContext);
        }
      } catch (err: any) {
        console.error(err);
        errorToast(err.message, [], toastContext);
      }
    })();
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          sx={{ fontWeight: 700 }}
          variant="h4"
          gutterBottom
          color="#000"
        >
          Flows
        </Typography>
        <Button
          variant="contained"
          onClick={handleClickCreateFlow}
          sx={{ m: 1 }}
        >
          + New Flow
        </Button>
      </Box>
      <TableContainer sx={{ marginTop: '50px' }}>
        <Table>
          <TableHead></TableHead>
          <TableBody>
            {flows.map((flow: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>
                  {flow.name} | cron: {flow.cron}
                </TableCell>
                <TableCell>
                  {!flow?.lastRun || flow?.lastRun?.status === 'COMPLETED' ? (
                    <Box
                      sx={{
                        display: 'flex',
                        color: '#399D47',
                        gap: '3px',
                        alignItems: 'center',
                      }}
                    >
                      <TaskAltIcon
                        sx={{ alignItems: 'center', fontSize: 'medium' }}
                      />
                      <Typography component="p">Running</Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        color: '#981F1F',
                        gap: '3px',
                        alignItems: 'center',
                      }}
                    >
                      <WarningAmberIcon
                        sx={{ alignItems: 'center', fontSize: 'medium' }}
                      />
                      <Typography component="p">Failed</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {flow?.lastRun ? (
                    <Typography component="p">
                      Last run {lastRunTime(flow?.lastRun?.startTime)}
                    </Typography>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    sx={{
                      m: 1,
                      backgroundColor: 'background.default',
                      color: 'secondary.main',
                      ':hover': { backgroundColor: 'background.default' },
                    }}
                  >
                    last log
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    sx={{ m: 1 }}
                    onClick={() => handleQuickRunDeployment(flow?.deploymentId)}
                  >
                    Run
                  </Button>
                  <IconButton
                    onClick={() => handleDeleteFlow(flow.deploymentId)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Flows;