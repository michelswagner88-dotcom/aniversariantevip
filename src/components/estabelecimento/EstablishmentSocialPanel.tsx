import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreatePost } from './CreatePost';
import { CreateStory } from './CreateStory';
import { Image, Zap } from 'lucide-react';

export const EstablishmentSocialPanel = ({ establishmentId }: { establishmentId: string }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Gestão de Conteúdo</h2>
        <p className="text-slate-400 text-sm">
          Publique posts e stories para engajar seus seguidores
        </p>
      </div>

      <Tabs defaultValue="post" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
          <TabsTrigger value="post" className="flex items-center gap-2">
            <Image size={16} />
            Post no Feed
          </TabsTrigger>
          <TabsTrigger value="story" className="flex items-center gap-2">
            <Zap size={16} />
            Story (24h)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="post" className="mt-6">
          <CreatePost establishmentId={establishmentId} />
        </TabsContent>

        <TabsContent value="story" className="mt-6">
          <CreateStory establishmentId={establishmentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
