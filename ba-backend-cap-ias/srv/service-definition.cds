
using { sap.cap.orders } from '../db/data-model';

service OrderService @(path: '/api/orders') {


    entity Orders as projection on orders.Orders;

    action completeOrder(orderId: UUID) returns {
        success: Boolean;
        message: String;
    };

    action cancelOrder(orderId: UUID) returns {
        success: Boolean;
        message: String;
    };
}
