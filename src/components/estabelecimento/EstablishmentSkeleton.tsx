// EstablishmentSkeleton.tsx - Skeleton Loading Premium

const EstablishmentSkeleton = () => {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero skeleton */}
      <div className="w-full h-56 sm:h-72 img-skeleton" />
      
      {/* Profile photo skeleton */}
      <div className="flex justify-center -mt-16 relative z-10">
        <div className="w-32 h-32 rounded-[18px] img-skeleton border-4 border-background" />
      </div>
      
      {/* Name skeleton */}
      <div className="mt-6 flex flex-col items-center gap-3 px-4">
        <div className="h-8 w-48 img-skeleton rounded-lg" />
        <div className="h-6 w-32 img-skeleton rounded-full" />
      </div>
      
      {/* Benefit card skeleton */}
      <div className="mx-4 mt-6 h-64 img-skeleton rounded-3xl" />
      
      {/* About skeleton */}
      <div className="mx-4 mt-6 h-32 img-skeleton rounded-2xl" />
      
      {/* Contact buttons skeleton */}
      <div className="mx-4 mt-6 grid grid-cols-3 gap-3">
        <div className="h-24 img-skeleton rounded-2xl" />
        <div className="h-24 img-skeleton rounded-2xl" />
        <div className="h-24 img-skeleton rounded-2xl" />
      </div>
      
      {/* Hours skeleton */}
      <div className="mx-4 mt-6 h-20 img-skeleton rounded-2xl" />
      
      {/* Location skeleton */}
      <div className="mx-4 mt-6 h-80 img-skeleton rounded-2xl" />
    </div>
  );
};

export default EstablishmentSkeleton;
