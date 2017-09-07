<%@ Page Async="true" Language="C#" AutoEventWireup="true" CodeBehind="Main.aspx.cs" Inherits="HotTubWeb.Main" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Hot Tub Site</title>
    <meta http-equiv="refresh" content="10;url=/"/> 
</head>
<body bgcolor="#FFFFFF">
    <asp:Table ID="deviceStatus" runat="server" Width="100%" Height="80%" Font-Size="Large"/>
    <form id="buttonForm" runat="server" >
    <asp:Button ID="ChangeState" runat="server" OnClick="ChangeState_Click" Width="100%" Font-Size="XX-Large" Height="10%"/>
    </form>
    <p>Copyright 2017 Kevin Saye</p>
</body>
</html>
