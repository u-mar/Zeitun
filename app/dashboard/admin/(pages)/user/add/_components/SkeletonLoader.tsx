const SkeletonLoader = () => {
    return (
      <div className="animate-pulse space-y-4">
        <div className="w-full h-10 bg-gray-300 rounded-md"></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-10 bg-gray-300 rounded-md"></div>
          <div className="h-10 bg-gray-300 rounded-md"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded-md"></div>
        <div className="h-10 bg-gray-300 rounded-md w-1/3"></div>
      </div>
    );
  };
  
  export default SkeletonLoader;
  