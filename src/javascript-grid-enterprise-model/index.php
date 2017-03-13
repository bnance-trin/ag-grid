<?php
$key = "Quick Filter";
$pageTitle = "JavaScript Grid Enterprise Model";
$pageDescription = "the most advanced row model for ag-Grid is the Enterprise row model, allowing server side grouping and aggregation.";
$pageKeyboards = "ag-Grid Enterprise Row Model";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h2 id="quickFilter">Enterprise Row Model</h2>

<p>
    Here it is...
</p>

<show-example example="exampleEnterpriseModel"></show-example>

<p>
    SQL for creating table in MySQL:
    <pre>create table olympic_winners (
    athlete varchar(20),
    age int,
    country varchar(20),
    country_group varchar(2),
    year int,
    date varchar(20),
    sport varchar(20),
    gold int,
    silver int,
    bronze int,
    total int
);</pre>

    Data was then exported from ag-Grid using <a href="../javascript-grid-export/">CSV Export</a> example
    and imported into MySQL database using <a href="https://www.mysql.com/products/workbench/">MySQL Workbench</a>.
    Enable PHP MySQL extension (uncomment mysql lines in php.ini).
</p>



<?php

phpinfo();

print('A');

//$link = mysqli_connect('mysql_host', 'mysql_user', 'mysql_password');

print('B');

/*class PaymentsDao {

    function getAccount($id, $email) {
        global $mysqli;

        $stmt = $mysqli->prepare("SELECT name, amount FROM ceolter_portal.accounts where id = ? and email = ?");
        $stmt->bind_param('is', $id, $email);

        $stmt->execute();
        $stmt->bind_result($name, $amount);

        $result = NULL;

        while($stmt->fetch()) {
            $result = new Account;
            $result->name = $name;
            $result->id = $id;
            $result->email = $email;
            $result->amount = $amount;
        }

        $stmt->close();

        return $result;
    }

}*/
?>


<?php include '../documentation-main/documentation_footer.php';?>
