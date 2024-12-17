import CardsDetails from "./_components/Card";
import OrderSummary from "./_components/OrderSummary";
import ProfitByCategory from "./_components/ProfitByCategory";
import SalesChart from "./_components/SalesChart";
import TopProducts from "./_components/TopProducts";

export const revalidate = 10; //revalidate every 10 seconds

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-6 bg-gray-100 min-h-screen">
      {/* Total Products, Available Stock, Low Stock, Out of Stock */}
      <CardsDetails />

      {/* Profit by Category */}
      <div className="lg:col-span-2">
        <ProfitByCategory />
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-2">
        <OrderSummary />
      </div>
     <div className="lg:col-span-4">
      <SalesChart />
     </div>
     <div className="lg:col-span-4">
      <TopProducts />
     </div>
    </div>
  );
};

export default Dashboard;
