/**
 * 控制器 - 详情
 */
app.controller('detail', ['$scope', '$controller', function ($scope, $controller) {

    $controller('generic', {$scope: $scope});

    $scope.totalPrice = 0;
    $scope.buy = {
        package: {},
        user_info: {
            name: null,
            phone: null,
            captcha: null
        },
        payment_method: 'wx'
    };

    // 删减商品
    $scope.goodsDel = function (packageId) {

        var key = 'limit_' + packageId;
        var number = $scope.buy.package[key].number - 1;

        if (number < 1) {
            $scope.buy.package[key] = null;
        } else {
            $scope.buy.package[key].number -= 1;
        }

        $scope.calPrice();
    };

    // 增加商品
    $scope.goodsAdd = function (packageId, limit) {

        var key = 'limit_' + packageId;

        if (limit >= 0) {
            var number = $scope.buy.package[key].number + 1;
            if (number > limit) {
                $scope.message('该套餐本次购买最大限定' + limit + '次');
                return false;
            }
        }

        $scope.buy.package[key].number += 1;
        $scope.calPrice();
    };

    // 计算总价
    $scope.calPrice = function () {

        var price = 0;
        $.each($scope.buy.package, function(k, v) {
            if ($scope.service.isEmpty(v)) {
                return true; // continue
            }

            price += parseInt(v.number) * parseInt(v.price * 100);
        });

        $scope.totalPrice = price / 100;
    };

    // 立即购买
    $scope.goToPayment = function () {

        if ($scope.totalPrice <= 0) {
            return $scope.message('请先选择您要购买的套餐');
        }

        var user = $scope.buy.user_info;

        if ($scope.service.isEmpty(user.name)) {
            return $scope.message('请填写联系人姓名');
        }

        if (!$scope.service.check(user.phone, 'phone')) {
            return $scope.message('手机号码格式不正确');
        }

        if (!user.captcha || user.captcha.toString().length !== 4) {
            return $scope.message('手机验证码应是4位数字');
        }

        var url = requestUrl + 'detail/prefix-payment';

        url += '&product_id=' + $('.body').attr('product-id');
        
        $.each($scope.buy.package, function (k, v) {
            if ($scope.service.isEmpty(v)) {
                return true;
            }
            url += '&package[' + v.id + ']=' + v.number;
        });

        url += '&user_info[name]=' + user.name;
        url += '&user_info[phone]=' + user.phone;
        url += '&user_info[captcha]=' + user.captcha;

        url += '&payment_method=' + $scope.buy.payment_method;
        url = $scope.service.supplyParams(url, ['channel']);

        location.href = url;
    };
}]);