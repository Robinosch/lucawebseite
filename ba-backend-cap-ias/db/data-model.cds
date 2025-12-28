namespace sap.cap.orders;

using { cuid, managed } from '@sap/cds/common';

entity Orders : cuid, managed {
    customer    : String not null;
    amount      : Decimal(10,2) not null;
    status      : String default 'OPEN'; // OPEN, COMPLETED, CANCELLED
}

annotate Orders with @(restrict: [
    {
        grant: 'READ',
        to: 'authenticated-user'
    },
    {
        grant: ['READ'],
        to: 'Manager',
        where: 'createdBy = $user'
    },
    {
        grant: ['*'],
        to: 'Admin'
    },
    {
        grant: 'READ',
        to: 'Observer'
    }
]);
