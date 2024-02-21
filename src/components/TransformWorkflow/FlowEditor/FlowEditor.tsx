import { Box, Divider } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import Canvas from './Components/Canvas';
import ProjectTree from './Components/ProjectTree';
import PreviewPane from './Components/PreviewPane';
import { httpGet } from '@/helpers/http';
import { useSession } from 'next-auth/react';
import FlowEditorContextProvider, {
  FlowEditorContext,
} from '@/contexts/FlowEditorContext';

export type DbtSourceModel = {
  source_name: string;
  input_name: string;
  input_type: 'model' | 'source';
  schema: string;
  id: string | null;
};

const FlowEditor = ({}) => {
  const { data: session } = useSession();
  const flowEditorContext = useContext(FlowEditorContext);
  const [sourcesModels, setSourcesModels] = useState<DbtSourceModel[]>([]);
  const [sourceModelToPreview, setSourceModelToPreview] =
    useState<DbtSourceModel | null>();

  const fetchSourcesModels = async () => {
    try {
      const response: DbtSourceModel[] = await httpGet(
        session,
        'transform/dbt_project/sources_models/'
      );
      response.map(
        (dbtSourceModel: DbtSourceModel, idx: number) =>
          (dbtSourceModel.id = `randomnode${idx}_${+new Date()}`)
      );
      setSourcesModels(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (session) fetchSourcesModels();
  }, [session]);

  console.log('context', flowEditorContext?.NodeActionTodo.state);

  return (
    <Box
      sx={{
        overflow: 'hidden',
        flexDirection: 'column',
        height: '100vh',
        paddingTop: '3.5rem',
      }}
    >
      <Box sx={{ display: 'flex', height: '70%', overflow: 'auto' }}>
        <Box sx={{ width: '20%' }}>
          <ProjectTree dbtSourceModels={sourcesModels} />
        </Box>
        <Divider orientation="vertical" sx={{ color: 'black' }} />
        <Box sx={{ width: '80%' }}>
          <Canvas />
        </Box>
      </Box>
      <Divider orientation="horizontal" sx={{ color: 'black' }} />
      <Box sx={{ height: '30%', overflow: 'auto' }}>
        <PreviewPane />
      </Box>
    </Box>
  );
};

export default FlowEditor;
