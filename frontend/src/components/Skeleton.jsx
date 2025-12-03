// frontend/src/components/Skeleton.jsx

export const SkeletonProviderCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
    <div className="flex gap-4">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
    <div className="mt-3 h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    <div className="mt-3 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

export const SkeletonServiceCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
    <div className="mt-3 flex gap-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
  </div>
);

export const SkeletonJobCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
    <div className="flex gap-3 mb-3">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
    <div className="space-y-2 mb-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
    <div className="flex gap-3 mb-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

export const SkeletonList = ({ count = 5, CardComponent = SkeletonProviderCard }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <CardComponent key={i} />
    ))}
  </div>
);

export default SkeletonList;