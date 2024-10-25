
<?php

    $data = new dataSource();
    $dataface = "AlignmentDB";
    $data->database = $dataface;
    $table = ['population', 'environment', 'agent'];

    include("header.html");

    //Environment = {dimensions, List of Population ids (2, 3, 4), collision}
    //Population = {n, list of input ids, outputs, recurrent, fitnessFunct index, }
    //Agent = {populationId, genes, Species (Spe_PId), list of previous E, score}
 

    // XOR training
    class Population{
        
    }

    include("footer.html");

?>

<?php
    class dataSource{

        private $servername = "localhost";
        private $username = "Rooted";
        private $password = "password";
        public $conn;
        public $database;
        
       
        private function connect($database = null){

                // Create connection
            $this->conn = new mysqli($this->servername, $this->username, $this->password, $database);

            // Check connection

            if ($this->conn->connect_error) {
                die("Connection failed: " .  $this->conn->connect_error);
            }
        }
        function createDatabase($name){

            $this->connect();
            $sql = "CREATE DATABASE IF NOT EXISTS $name;";

            try{
                if ($this->conn->query($sql) === TRUE) {

                    echo "Database: $name has been created";
                    echo "<br>";
                } else {
                    throw new Exception();
                }
            }
            catch(Exception $e){
                echo 'Message: '.$e->getMessage();
                echo "<br>";

            }

            $this->conn->close();
        }
        function dropDatabase($name){

            $this->connect();
            $sql = "DROP DATABASE IF EXISTS $name;";

            try{
                if ($this->conn->query($sql) === TRUE) {
                    echo "Database: $name has been dropped";
                    echo "<br>";
                } else {
                    throw new Exception();
                }
            }
            catch(Exception $e){
                echo 'Message: '.$e->getMessage();
                echo "<br>";
            }
          
            $this->conn->close();
        }
        function createTable($columns, $tableName, $database = null){

            $this->connect();
            $sql = $database == null ? "CREATE TABLE IF NOT EXISTS $this->database.$tableName($columns);"  : "CREATE TABLE IF NOT EXISTS $database.$tableName($columns);";
    
            try{
                if ($this->conn->query($sql) === TRUE) {
                    echo $database == null ? "Table: $this->database.$tableName has been created" : "Table: $database.$tableName has been created";
                    echo "<br>";    
                } else {
                    throw new Exception();
                }
            }
            catch(Exception $e){
                echo 'Message: '.$e->getMessage();
                echo "<br>";
            }
          
            
            $this->conn->close();
        }
        function dropTable($tableName, $database = null){

            $this->connect();
            $sql =  $database == null ? "DROP TABLE IF EXISTS $this->database.$tableName;" : "DROP TABLE IF EXISTS $database.$tableName;";
    
            try{
                if ($this->conn->query($sql) === TRUE) {
                    echo  $database == null ? "Table: $this->database.$tableName has been dropped" : "Table: $database.$tableName has been dropped";
                    echo "<br>";
                } else {
                    throw new Exception();
                }
            }
            catch(Exception $e){
                echo 'Message: '.$e->getMessage();
                echo "<br>";
            }
          
            $this->conn->close();
        }
        function addColumn($addition, $tableName, $database = null){  

            $this->connect();
            $sql = $database == null ? "ALTER TABLE $this->database.$tableName ADD  $addition;" : "ALTER TABLE $database.$tableName ADD  $addition;";
    
            try{
                   
            if ($this->conn->query($sql) === TRUE) {
                echo $database == null ? "$addition has been added to $this->database.$tableName" : "$addition has been added to $database.$tableName";
                echo "<br>";
            } else {
                    throw new Exception();
                }
            }
            catch(Exception $e){
                echo 'Message: '.$e->getMessage();
                echo "<br>";
            }
    
            $this->conn->close();
        }      
        function dropColumn($column, $tableName, $database = null){  

            $this->connect();
            $sql = $database == null ? "ALTER TABLE $this->database.$tableName DROP COLUMN  $column;" :  "ALTER TABLE $database.$tableName DROP COLUMN  $column;";
    
            try{
                   
                if ($this->conn->query($sql) === TRUE) {
                    echo $database == null ? "$column from $this->database.$tableName has been dropped" : "$column from $database.$tableName has been dropped";
                    echo "<br>";
                } else {
                        throw new Exception();
                    }
                }
                catch(Exception $e){
                    echo 'Message: '.$e->getMessage();
                    echo "<br>";
                }
          
            $this->conn->close();
        }  
        function modifyColumn($columnAndType, $tableName, $database = null){  

            $this->connect();
            $sql = $database == null ? "ALTER TABLE $this->database.$tableName MODIFY COLUMN $columnAndType;" : "ALTER TABLE $database.$tableName MODIFY COLUMN  $columnAndType;";
    
            try{
                   
                if ($this->conn->query($sql) === TRUE) {
                    echo $database == null ? "$columnAndType in $this->database.$tableName has been modified" : "$columnAndType in $database.$tableName has been modified";
                    echo "<br>";
                } else {
                        throw new Exception();
                    }
                }
                catch(Exception $e){
                    echo 'Message: '.$e->getMessage();
                    echo "<br>";
                }
       
            $this->conn->close();
        }       

        function renameColumn($old_name, $new_name, $tableName, $database = null){
            $this->connect();
            $sql = $database == null ? "ALTER TABLE $this->database.$tableName RENAME COLUMN $old_name to $new_name;" : "ALTER TABLE $database.$tableName RENAME COLUMN $old_name to $new_name;";
    
            try{

                if ($this->conn->query($sql) === TRUE) {
                    echo $database == null ? "Column $old_name changed to $new_name in $this->database.$tableName <br>" : "Column $old_name changed to $new_name in $database.$tableName <br>";
                    echo "<br>";
                }else{
                    throw new Exception();
                }
            }
            catch(Exception $e){
                echo 'Message: '.$e->getMessage();
                echo "<br>";
            }
    
            $this->conn->close();
        } 
     
        function insertInfo($info, $tableName, $columns, $database = null){ // "' Info '", remember the columns 

            $this->connect();
            $sql = $database == null ? "INSERT INTO $this->database.$tableName ($columns) VALUES ($info);" :  "INSERT INTO $database.$tableName ($columns) VALUES ($info);";
    
            try{
                   
                if ($this->conn->query($sql) === TRUE) {
                    echo $database == null ? "$info inserted in $this->database.$tableName, columns: $columns" : "$info inserted in $database.$tableName, columns: $columns";
                    echo "<br>";
                } else {
                        throw new Exception();
                    }
                }
                catch(Exception $e){
                    echo 'Message: '.$e->getMessage();
                    echo "<br>";
                }
                
            $this->conn->close();
        }

        function deleteInfo($id, $tableName, $column = 'id', $database = null){
            
            $this->connect();
            $sql = $database == null ? "DELETE FROM $this->database.$tableName WHERE $column = $id;" : "DELETE FROM $database.$tableName WHERE $column = $id;";
    
            try{
                   
                if ($this->conn->query($sql) === TRUE) {

                    echo $database == null ? "deleted entries where $column = $id in $this->database.$tableName" : "deleted entries where $column = $id in $database.$tableName";
                    echo "<br>";
                } else {
                        throw new Exception();
                    }
                }
                catch(Exception $e){
                    echo 'Message: '.$e->getMessage();
                    echo "<br>";
                }
                
            $this->conn->close();
        }

        function update($id, $columnValue, $tableName, $column = 'id', $database = null){
            
            $this->connect();
            $sql = $database == null ? "UPDATE  $this->database.$tableName  SET $columnValue WHERE $column = $id;" : "UPDATE  $database.$tableName  SET $columnValue WHERE id = $id;";
    
            try{
                   
                if ($this->conn->query($sql) === TRUE) {
                
                    echo $database == null ? "Updated id : $id at: $columnValue, $this->database.$tableName" :  "Updated id : $id at: $columnValue, $database.$tableName";
                    echo "<br>";
                } else {
                        throw new Exception();
                    }
                }
                catch(Exception $e){
                    echo 'Message: '.$e->getMessage();
                    echo "<br>";
                }
                
            $this->conn->close();
        }

        function selectInfo($tableName, $what, $database = null){  

            $this->connect();

            $sql = $database == null ? "SELECT $what FROM $this->database.$tableName;" : "SELECT $what FROM $database.$tableName;";
    
            $result = $this->conn->query($sql);    
            $final = array();
            
            while($data = $result->fetch_assoc()){

                array_push($final, $data) ;
            }            
            return $final;

            $this->conn->close();
        }  
        function displayInfo($tableName, $what = '*', $database = null){

            foreach($this->selectInfo($tableName, $what, $database == null ? $this->database : $database) as $x => $y){
                // echo "$x: ";
                foreach($y as $sec){
                    echo "$sec, ";
                } 
                echo "<br>";
            }
        }
    }
    
?>