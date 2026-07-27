import java.sql.*;
public class CheckDB {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/SCAPA";
        String user = "postgres";
        String password = "123";
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            DatabaseMetaData meta = conn.getMetaData();
            ResultSet rs = meta.getColumns(null, "seguridad", "usuario", null);
            while (rs.next()) {
                System.out.println(rs.getString("COLUMN_NAME") + " - " + rs.getString("TYPE_NAME") + " - Nullable: " + rs.getString("IS_NULLABLE"));
            }
        }
    }
}
